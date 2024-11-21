'use client'

import {getRockpaperscissorsProgram, getRockpaperscissorsProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useRockpaperscissorsProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getRockpaperscissorsProgramId(cluster.network as Cluster), [cluster])
  const program = getRockpaperscissorsProgram(provider)

  const accounts = useQuery({
    queryKey: ['rockpaperscissors', 'all', { cluster }],
    queryFn: () => program.account.rockpaperscissors.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['rockpaperscissors', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ rockpaperscissors: keypair.publicKey }).signers([keypair]).rpc(),
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
    initialize,
  }
}

export function useRockpaperscissorsProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useRockpaperscissorsProgram()

  const accountQuery = useQuery({
    queryKey: ['rockpaperscissors', 'fetch', { cluster, account }],
    queryFn: () => program.account.rockpaperscissors.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['rockpaperscissors', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ rockpaperscissors: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['rockpaperscissors', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ rockpaperscissors: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['rockpaperscissors', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ rockpaperscissors: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['rockpaperscissors', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ rockpaperscissors: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
