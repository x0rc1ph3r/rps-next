// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import RockpaperscissorsIDL from '../target/idl/rockpaperscissors.json'
import type { Rockpaperscissors } from '../target/types/rockpaperscissors'

// Re-export the generated IDL and type
export { Rockpaperscissors, RockpaperscissorsIDL }

// The programId is imported from the program IDL.
export const ROCKPAPERSCISSORS_PROGRAM_ID = new PublicKey(RockpaperscissorsIDL.address)

// This is a helper function to get the Rockpaperscissors Anchor program.
export function getRockpaperscissorsProgram(provider: AnchorProvider) {
  return new Program(RockpaperscissorsIDL as Rockpaperscissors, provider)
}

// This is a helper function to get the program ID for the Rockpaperscissors program depending on the cluster.
export function getRockpaperscissorsProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Rockpaperscissors program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return ROCKPAPERSCISSORS_PROGRAM_ID
  }
}
