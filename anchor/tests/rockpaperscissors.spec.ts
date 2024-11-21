import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Rockpaperscissors} from '../target/types/rockpaperscissors'

describe('rockpaperscissors', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Rockpaperscissors as Program<Rockpaperscissors>

  const rockpaperscissorsKeypair = Keypair.generate()

  it('Initialize Rockpaperscissors', async () => {
    await program.methods
      .initialize()
      .accounts({
        rockpaperscissors: rockpaperscissorsKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([rockpaperscissorsKeypair])
      .rpc()

    const currentCount = await program.account.rockpaperscissors.fetch(rockpaperscissorsKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Rockpaperscissors', async () => {
    await program.methods.increment().accounts({ rockpaperscissors: rockpaperscissorsKeypair.publicKey }).rpc()

    const currentCount = await program.account.rockpaperscissors.fetch(rockpaperscissorsKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Rockpaperscissors Again', async () => {
    await program.methods.increment().accounts({ rockpaperscissors: rockpaperscissorsKeypair.publicKey }).rpc()

    const currentCount = await program.account.rockpaperscissors.fetch(rockpaperscissorsKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Rockpaperscissors', async () => {
    await program.methods.decrement().accounts({ rockpaperscissors: rockpaperscissorsKeypair.publicKey }).rpc()

    const currentCount = await program.account.rockpaperscissors.fetch(rockpaperscissorsKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set rockpaperscissors value', async () => {
    await program.methods.set(42).accounts({ rockpaperscissors: rockpaperscissorsKeypair.publicKey }).rpc()

    const currentCount = await program.account.rockpaperscissors.fetch(rockpaperscissorsKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the rockpaperscissors account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        rockpaperscissors: rockpaperscissorsKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.rockpaperscissors.fetchNullable(rockpaperscissorsKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
