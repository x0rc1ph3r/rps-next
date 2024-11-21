import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Rockpaperscissors } from '../target/types/rockpaperscissors'
import { keccak256 } from 'ethereum-cryptography/keccak';

type Move = "rock" | "paper" | "scissors"

enum Moves {
  "rock" = 1,
  "paper" = 2,
  "scissors" = 3,
}

function generateHashedMove(playerMove: Move, salt: string) {
  const concatenated = new TextEncoder().encode(`${playerMove}${salt}`);
  const hashed = keccak256(concatenated);
  return hashed;
}

const player1Move: Move = "paper"
const player1Salt = "12345"
const player1Hash = Array.from(generateHashedMove(player1Move, player1Salt))

const player2Move: Move = "rock"
const player2Salt = "iamnoob"
const player2Hash = Array.from(generateHashedMove(player2Move, player2Salt))


describe('rockpaperscissors', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Rockpaperscissors as Program<Rockpaperscissors>

  const keypair1 = Keypair.generate()

  it('Create room', async () => {
    await program.methods
      .createRoom(
        new anchor.BN(1)
      )
      .rpc()

    const [roomAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("room"), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const roomData = await program.account.room.fetch(roomAddress)

    console.log(roomData)

    expect(roomData.player1).toEqual(new PublicKey("i2tZJMMTqrcYv53qdLFsouL1JQPWgKiTfZ6sRDfk7nL"))
  })

  it('join room', async () => {
    await program.methods
      .joinRoom(
        new anchor.BN(1)
      )
      .accounts({
        signer: keypair1.publicKey
      })
      .signers([keypair1])
      .rpc()

    const [roomAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("room"), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const roomData = await program.account.room.fetch(roomAddress)

    console.log(roomData)

    expect(roomData.player2).toEqual(keypair1.publicKey)
  })

  it('player1 make move', async () => {
    await program.methods
      .submitMove(
        new anchor.BN(1),
        player1Hash,
      )
      .rpc()

    const [roomAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("room"), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const roomData = await program.account.room.fetch(roomAddress)

    console.log(roomData)

    expect(roomData.player1HashedMove).toEqual(player1Hash)
  })

  it('player2 make move', async () => {
    await program.methods
      .submitMove(
        new anchor.BN(1),
        player2Hash,
      )
      .accounts({
        signer: keypair1.publicKey
      })
      .signers([keypair1])
      .rpc()

    const [roomAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("room"), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const roomData = await program.account.room.fetch(roomAddress)

    console.log(roomData)

    expect(roomData.player2HashedMove).toEqual(player2Hash)
  })

  it('player2 reveal move', async () => {
    await program.methods
      .revealMove(
        new anchor.BN(1),
        player2Move,
        player2Salt,
      )
      .accounts({
        signer: keypair1.publicKey
      })
      .signers([keypair1])
      .rpc()

    const [roomAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("room"), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const roomData = await program.account.room.fetch(roomAddress)

    console.log(roomData)

    expect(roomData.player2Move).toEqual(Moves[player2Move])
  })

  it('player1 reveal move', async () => {
    await program.methods
      .revealMove(
        new anchor.BN(1),
        player1Move,
        player1Salt,
      )
      .rpc()

    const [roomAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("room"), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const roomData = await program.account.room.fetch(roomAddress)

    console.log(roomData)

    expect(roomData.player1Move).toEqual(Moves[player1Move])
  })

  it('check result', async () => {
    const [roomAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("room"), new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      program.programId
    )

    const roomData = await program.account.room.fetch(roomAddress)

    console.log(roomData.result)
  })

})
