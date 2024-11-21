#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak::hash;
use anchor_lang::solana_program::system_instruction;

declare_id!("9YTcpmZVVy2Gb87SvGTCc2oF59RB9nfjtnUeV2EmGGkW");

const TREASURER: Pubkey = Pubkey::new_from_array([
    10, 130, 242, 239, 202, 84, 123, 224, 140, 93, 149, 118, 81, 5, 184, 247, 103, 104, 180, 35,
    52, 87, 161, 5, 162, 28, 10, 223, 236, 37, 81, 181
]);

#[program]
pub mod rockpaperscissors {
    use super::*;

    pub fn create_treasury(ctx: Context<CreateTreasury>) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.treasurer = TREASURER; 
        treasury.bump = ctx.bumps.treasury;
        Ok(())
    }

    pub fn set_treasury(ctx: Context<SetTreasury>, new_treasurer: Pubkey) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.treasurer = new_treasurer; 
        Ok(())
    }

    pub fn create_room(ctx: Context<CreateRoom>, room_id: u64, entry_fee: u64) -> Result<()> {
        // Ensure Player 1 has enough SOL to pay the entry fee
        require!(
            **ctx.accounts.signer.to_account_info().lamports.borrow() >= entry_fee,
            GameError::InsufficientFunds
        );
        // Deduct the entry fee from Player 1
        let transfer_instruction = system_instruction::transfer(
            &ctx.accounts.signer.key(), // Sender public key
            &ctx.accounts.room.key(),   // Room account public key
            entry_fee,                  // Entry fee amount
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.room.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let room = &mut ctx.accounts.room;
        room.room_id = room_id;
        room.player1 = ctx.accounts.signer.key();
        room.player2 = Pubkey::default();
        room.player1_hashed_move = None;
        room.player2_hashed_move = None;
        room.player1_move = None;
        room.player2_move = None;
        room.status = RoomStatus::WaitingForPlayer;
        room.result = None;
        room.entry_fee = entry_fee;
        room.deposit_total = entry_fee;
        room.bump = ctx.bumps.room;

        Ok(())
    }

    pub fn join_room(ctx: Context<JoinRoom>, _room_id: u64) -> Result<()> {
        let transfer_amount = ctx.accounts.room.entry_fee;
        require!(
            **ctx.accounts.signer.to_account_info().lamports.borrow() >= transfer_amount,
            GameError::InsufficientFunds
        );
        // Deduct the entry fee from Player 2
        let transfer_instruction = system_instruction::transfer(
            &ctx.accounts.signer.key(), // Sender public key
            &ctx.accounts.room.key(),   // Room account public key
            transfer_amount,            // Entry fee amount
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.room.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let room = &mut ctx.accounts.room;
        require!(
            room.status == RoomStatus::WaitingForPlayer,
            GameError::RoomNotJoinable
        );
        require!(
            room.player1 != ctx.accounts.signer.key(),
            GameError::CannotJoinOwnRoom
        );

        room.player2 = ctx.accounts.signer.key();
        room.deposit_total += transfer_amount;
        room.status = RoomStatus::WaitingForMoves;

        Ok(())
    }

    pub fn submit_move(ctx: Context<EditRoom>, _room_id: u64, hashed_move: [u8; 32]) -> Result<()> {
        let room = &mut ctx.accounts.room;
        require!(
            room.status == RoomStatus::WaitingForMoves,
            GameError::RoomNotReady
        );
        let user = ctx.accounts.signer.key();

        if room.player1 == user {
            require!(
                room.player1_hashed_move.is_none(),
                GameError::MoveAlreadySubmitted
            );
            room.player1_hashed_move = Some(hashed_move);
        } else if room.player2 == user {
            require!(
                room.player2_hashed_move.is_none(),
                GameError::MoveAlreadySubmitted
            );
            room.player2_hashed_move = Some(hashed_move);
        } else {
            return err!(GameError::NotAPlayer);
        }

        if room.player1_hashed_move.is_some() && room.player2_hashed_move.is_some() {
            room.status = RoomStatus::WaitingForReveal;
        }

        Ok(())
    }

    pub fn reveal_move(
        ctx: Context<RevealWinner>,
        _room_id: u64,
        original_move: String,
        salt: String,
    ) -> Result<()> {
        let room = &mut ctx.accounts.room;
        require!(
            room.status == RoomStatus::WaitingForReveal,
            GameError::RoomNotReady
        );
        let user = ctx.accounts.signer.key();

        let hashed_move = hash(format!("{}{}", original_move, salt).as_bytes()).to_bytes();

        if room.player1 == user {
            require!(
                room.player1_hashed_move == Some(hashed_move),
                GameError::InvalidMoveReveal
            );
            room.player1_move = Some(original_move_to_u8(&original_move)?);
        } else if room.player2 == user {
            require!(
                room.player2_hashed_move == Some(hashed_move),
                GameError::InvalidMoveReveal
            );
            room.player2_move = Some(original_move_to_u8(&original_move)?);
        } else {
            return err!(GameError::NotAPlayer);
        }

        if room.player1_move.is_some() && room.player2_move.is_some() {
            room.status = RoomStatus::Complete;
            resolve_game(room)?;

            let treasurer_share = room.deposit_total * 5 / 100; // 5%
            let winner_share = room.deposit_total - treasurer_share; // 95%

            let winner = match room.result {
                Some(GameResult::Player1Wins) => room.player1,
                Some(GameResult::Player2Wins) => room.player2,
                _ => {
                    // No payout for a draw, refund the players
                    let refund_amount = room.deposit_total / 2;

                    **ctx.accounts.room.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
                    **ctx.accounts.player1.to_account_info().try_borrow_mut_lamports()? += refund_amount;
                    **ctx.accounts.room.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
                    **ctx.accounts.player2.to_account_info().try_borrow_mut_lamports()? += refund_amount;

                    return Ok(());
                }
            };

            require!(
                winner == ctx.accounts.winner.key(),
                GameError::WrongWinner
            );
            **ctx.accounts.room.to_account_info().try_borrow_mut_lamports()? -= treasurer_share;
            **ctx.accounts.treasurer.to_account_info().try_borrow_mut_lamports()? += treasurer_share;
            **ctx.accounts.room.to_account_info().try_borrow_mut_lamports()? -= winner_share;
            **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += winner_share;

        }

        Ok(())
    }
}

fn resolve_game(room: &mut Account<Room>) -> Result<()> {
    let player1_move = room.player1_move.ok_or(GameError::IncompleteGame)?;
    let player2_move = room.player2_move.ok_or(GameError::IncompleteGame)?;

    room.result = Some(match (player1_move, player2_move) {
        (1, 2) | (2, 3) | (3, 1) => GameResult::Player2Wins,
        (2, 1) | (3, 2) | (1, 3) => GameResult::Player1Wins,
        _ => GameResult::Draw,
    });

    Ok(())
}

fn original_move_to_u8(move_str: &str) -> Result<u8> {
    match move_str {
        "rock" => Ok(1),
        "paper" => Ok(2),
        "scissors" => Ok(3),
        _ => err!(GameError::InvalidMove),
    }
}

#[derive(Accounts)]
pub struct CreateTreasury<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + Treasury::INIT_SPACE,
        seeds = [b"treasury".as_ref()],
        bump,
    )]
    pub treasury: Account<'info, Treasury>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetTreasury<'info> {
    #[account(mut)]
    pub treasurer: Signer<'info>,

    #[account(
        mut,
        has_one = treasurer,
    )]
    pub treasury: Account<'info, Treasury>,
}

#[derive(Accounts)]
#[instruction(room_id: u64)]
pub struct CreateRoom<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + Room::INIT_SPACE,
        seeds = [b"room".as_ref(), room_id.to_le_bytes().as_ref()],
        bump
    )]
    pub room: Account<'info, Room>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(room_id: u64)]
pub struct JoinRoom<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"room".as_ref(), room_id.to_le_bytes().as_ref()],
        bump
    )]
    pub room: Account<'info, Room>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(room_id: u64)]
pub struct EditRoom<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"room".as_ref(), room_id.to_le_bytes().as_ref()],
        bump
    )]
    pub room: Account<'info, Room>,
}

#[derive(Accounts)]
#[instruction(room_id: u64)]
pub struct RevealWinner<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"room".as_ref(), room_id.to_le_bytes().as_ref()],
        bump
    )]
    pub room: Account<'info, Room>,

    #[account(
        mut,
        seeds = [b"treasury".as_ref()],
        bump
    )]
    pub treasury: Account<'info, Treasury>,

    /// CHECK: This is safe because it is the fixed treasurer account
    #[account(
        mut,
        constraint = treasurer.key() == treasury.treasurer,
    )]
    pub treasurer: AccountInfo<'info>,

    /// CHECK: This is safe because it is the player
    #[account(
        mut,
        constraint = player1.key() == room.player1,
    )]
    pub player1: AccountInfo<'info>,

    /// CHECK: This is safe because it is the player
    #[account(
        mut,
        constraint = player2.key() == room.player2,
    )]
    pub player2: AccountInfo<'info>,

    /// CHECK: This is safe because it's determined by the game winner
    #[account(mut)]
    pub winner: AccountInfo<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Room {
    pub room_id: u64,
    pub player1: Pubkey,
    pub player2: Pubkey,
    pub player1_hashed_move: Option<[u8; 32]>,
    pub player2_hashed_move: Option<[u8; 32]>,
    pub player1_move: Option<u8>,
    pub player2_move: Option<u8>,
    pub status: RoomStatus,
    pub result: Option<GameResult>,
    pub entry_fee: u64,
    pub deposit_total: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Treasury {
    pub treasurer: Pubkey,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum RoomStatus {
    WaitingForPlayer,
    WaitingForMoves,
    WaitingForReveal,
    Complete,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum GameResult {
    Player1Wins,
    Player2Wins,
    Draw,
}

#[error_code]
pub enum GameError {
    #[msg("The room is not joinable.")]
    RoomNotJoinable,
    #[msg("Cannot join your own room.")]
    CannotJoinOwnRoom,
    #[msg("You are not a player in this room.")]
    NotAPlayer,
    #[msg("The game is not ready yet.")]
    RoomNotReady,
    #[msg("Invalid move reveal.")]
    InvalidMoveReveal,
    #[msg("Move already submitted.")]
    MoveAlreadySubmitted,
    #[msg("The game is incomplete.")]
    IncompleteGame,
    #[msg("Invalid move.")]
    InvalidMove,
    #[msg("Insufficient funds to join the room.")]
    InsufficientFunds,
    #[msg("Wrong Winner")]
    WrongWinner,
    #[msg("Invalid Treasurer")]
    InvalidTreasurer,
}
