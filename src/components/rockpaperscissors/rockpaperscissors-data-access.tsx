'use client'

import { getRockpaperscissorsProgram, getRockpaperscissorsProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { BN } from '@coral-xyz/anchor'

import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

interface CreateArgs {
  roomId: number;
  entryFee: number;
}

interface MoveArgs {
  roomId: number | BN;
  moveHash: Array<number>;
}

interface RevealArgs {
  roomId: number | BN;
  move: string;
  salt: string;
  player1: string;
  player2: string;
}

export function useRockpaperscissorsProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getRockpaperscissorsProgramId(cluster.network as Cluster), [cluster])
  const program = getRockpaperscissorsProgram(provider)

  const accounts = useQuery({
    queryKey: ['rockpaperscissors', 'all', { cluster }],
    queryFn: () => program.account.room.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createRoom = useMutation<string, Error, CreateArgs>({
    mutationKey: ['rockpaperscissors', 'createRoom', { cluster }],
    mutationFn: ({ roomId, entryFee }) =>
      program.methods.createRoom(new BN(roomId), new BN(entryFee)).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createRoom,
  }
}

export function useRockpaperscissorsProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useRockpaperscissorsProgram()

  const accountQuery = useQuery({
    queryKey: ['rockpaperscissors', 'fetch', { cluster, account }],
    queryFn: () => program.account.room.fetch(account),
  })

  const joinRoom = useMutation({
    mutationKey: ['rockpaperscissors', 'join', { cluster, account }],
    mutationFn: (roomId: number) => program.methods.joinRoom(new BN(roomId)).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const playerMove = useMutation<string, Error, MoveArgs>({
    mutationKey: ['rockpaperscissors', 'play', { cluster, account }],
    mutationFn: ({ roomId, moveHash }) => program.methods.submitMove(new BN(roomId), moveHash).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const revealMove = useMutation<string, Error, RevealArgs>({
    mutationKey: ['rockpaperscissors', 'reveal', { cluster, account }],
    mutationFn: ({ roomId, move, salt, player1, player2 }) => program.methods.revealMove(new BN(roomId), move, salt).accounts({ treasurer: new PublicKey("i2tZJMMTqrcYv53qdLFsouL1JQPWgKiTfZ6sRDfk7nL"), player1: new PublicKey(player1), player2: new PublicKey(player2), winner: new PublicKey(player1) }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
    onError: (error, variables) => {
      console.log("Error occured:", error)
      revealMove2.mutateAsync({ roomId: variables.roomId, move: variables.move, salt: variables.salt, player1: variables.player1, player2: variables.player2 })
    }
  })

  const revealMove2 = useMutation<string, Error, RevealArgs>({
    mutationKey: ['rockpaperscissors', 'close', { cluster, account }],
    mutationFn: ({ roomId, move, salt, player1, player2 }) => program.methods.revealMove(new BN(roomId), move, salt).accounts({ treasurer: new PublicKey("i2tZJMMTqrcYv53qdLFsouL1JQPWgKiTfZ6sRDfk7nL"), player1: new PublicKey(player1), player2: new PublicKey(player2), winner: new PublicKey(player2) }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  return {
    accountQuery,
    joinRoom,
    playerMove,
    revealMove,
  }
}
