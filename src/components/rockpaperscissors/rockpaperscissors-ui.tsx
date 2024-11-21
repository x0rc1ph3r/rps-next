'use client'

import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { ellipsify } from '../ui/ui-layout'
import { useRockpaperscissorsProgram, useRockpaperscissorsProgramAccount } from './rockpaperscissors-data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import { keccak256 } from 'ethereum-cryptography/keccak';

function generateHashedMove(playerMove: string, salt: string) {
  const concatenated = new TextEncoder().encode(`${playerMove}${salt}`);
  const hashed = keccak256(concatenated);
  return hashed;
}

export function RockpaperscissorsCreate() {
  const { createRoom } = useRockpaperscissorsProgram()
  const { publicKey } = useWallet();
  const [roomNo, setRoomNo] = useState(1);
  const [entryFee, setEntryFee] = useState(0);

  if (publicKey) {
    return (
      <div>
        <input
          type='number'
          placeholder='Room id'
          value={roomNo}
          onChange={(e) => { setRoomNo(parseInt(e.target.value)) }}
          className='input input-bordered w-full max max-w-xs'
        />
        <input
          type='number'
          placeholder='Entry Fees'
          value={entryFee}
          onChange={(e) => { setEntryFee(parseInt(e.target.value)) }}
          className='input input-bordered w-full max max-w-xs'
        />
        <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={() => createRoom.mutateAsync({ roomId: roomNo, entryFee: entryFee * LAMPORTS_PER_SOL })}
          disabled={createRoom.isPending}
        >
          Create Room {createRoom.isPending && '...'}
        </button>
      </div>
    )
  }
}

export function RockpaperscissorsList() {
  const { accounts, getProgramAccount } = useRockpaperscissorsProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <RockpaperscissorsCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function RockpaperscissorsCard({ account }: { account: PublicKey }) {
  const { accountQuery, joinRoom, playerMove, revealMove } = useRockpaperscissorsProgramAccount({
    account,
  })
  const [toMove, setToMove] = useState("")
  const [moveSalt, setMoveSalt] = useState("")

  const count = useMemo(() => accountQuery.data?.roomId ?? 0, [accountQuery.data?.roomId])
  const player1 = useMemo(() => accountQuery.data?.player1 ?? 0, [accountQuery.data?.player1])
  const player2 = useMemo(() => accountQuery.data?.player2 ?? 0, [accountQuery.data?.player2])
  const roomId = useMemo(() => accountQuery.data?.roomId ?? 0, [accountQuery.data?.roomId])
  const roomStatus = useMemo(() => accountQuery.data?.status ?? 0, [accountQuery.data?.status])
  const roomRes = useMemo(() => accountQuery.data?.result ?? 0, [accountQuery.data?.result])

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => accountQuery.refetch()}>
            {count.toString()}
          </h2>
          <p>{player1.toString()}</p>
          <p>{player2.toString()}</p>
          <div className="card-actions justify-around">
            {roomStatus.waitingForPlayer && <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => joinRoom.mutateAsync(roomId)}
              disabled={joinRoom.isPending}
            >
              Join Room
            </button>}
            {roomStatus.waitingForMoves && <div>
              <input
                type='text'
                placeholder='Move'
                value={toMove}
                onChange={(e) => { setToMove(e.target.value) }}
                className='input input-bordered w-full max max-w-xs'
              />
              <input
                type='text'
                placeholder='Salt'
                value={moveSalt}
                onChange={(e) => { setMoveSalt(e.target.value) }}
                className='input input-bordered w-full max max-w-xs'
              />
              <button
                className="btn btn-xs lg:btn-md btn-outline"
                onClick={() => playerMove.mutateAsync({ roomId: roomId, moveHash: Array.from(generateHashedMove(toMove, moveSalt)) })}
                disabled={playerMove.isPending}
              >
                Make Move
              </button></div>}
            {roomStatus.waitingForReveal && <div>
              <input
                type='text'
                placeholder='Move'
                value={toMove}
                onChange={(e) => { setToMove(e.target.value) }}
                className='input input-bordered w-full max max-w-xs'
              />
              <input
                type='text'
                placeholder='Salt'
                value={moveSalt}
                onChange={(e) => { setMoveSalt(e.target.value) }}
                className='input input-bordered w-full max max-w-xs'
              /><button
                className="btn btn-xs lg:btn-md btn-outline"
                onClick={() => revealMove.mutateAsync({ roomId: roomId, move: toMove, salt: moveSalt, player1: player1.toString(), player2: player2.toString() })}
                disabled={revealMove.isPending}
              >
                Reveal Move
              </button></div>}
            {roomStatus.complete && roomRes.player1Wins && <p className="card-title justify-center text-3xl">Player 1 wins!</p>}
            {roomStatus.complete && roomRes.player2Wins && <p className="card-title justify-center text-3xl">Player 2 wins!</p>}
            {roomStatus.complete && roomRes.draw && <p className="card-title justify-center text-3xl">It&apos;s a draw</p>}
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
