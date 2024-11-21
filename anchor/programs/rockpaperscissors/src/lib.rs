#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod rockpaperscissors {
    use super::*;

  pub fn close(_ctx: Context<CloseRockpaperscissors>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.rockpaperscissors.count = ctx.accounts.rockpaperscissors.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.rockpaperscissors.count = ctx.accounts.rockpaperscissors.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeRockpaperscissors>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.rockpaperscissors.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeRockpaperscissors<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Rockpaperscissors::INIT_SPACE,
  payer = payer
  )]
  pub rockpaperscissors: Account<'info, Rockpaperscissors>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseRockpaperscissors<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub rockpaperscissors: Account<'info, Rockpaperscissors>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub rockpaperscissors: Account<'info, Rockpaperscissors>,
}

#[account]
#[derive(InitSpace)]
pub struct Rockpaperscissors {
  count: u8,
}
