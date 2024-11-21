/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/rockpaperscissors.json`.
 */
export type Rockpaperscissors = {
  "address": "9YTcpmZVVy2Gb87SvGTCc2oF59RB9nfjtnUeV2EmGGkW",
  "metadata": {
    "name": "rockpaperscissors",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createRoom",
      "discriminator": [
        130,
        166,
        32,
        2,
        247,
        120,
        178,
        53
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "room",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roomId",
          "type": "u64"
        },
        {
          "name": "entryFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createTreasury",
      "discriminator": [
        254,
        98,
        217,
        51,
        25,
        88,
        140,
        45
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "joinRoom",
      "discriminator": [
        95,
        232,
        188,
        81,
        124,
        130,
        78,
        139
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "room",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roomId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "revealMove",
      "discriminator": [
        30,
        133,
        198,
        26,
        106,
        44,
        55,
        149
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "room",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "treasurer",
          "writable": true
        },
        {
          "name": "player1",
          "writable": true
        },
        {
          "name": "player2",
          "writable": true
        },
        {
          "name": "winner",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "roomId",
          "type": "u64"
        },
        {
          "name": "originalMove",
          "type": "string"
        },
        {
          "name": "salt",
          "type": "string"
        }
      ]
    },
    {
      "name": "setTreasury",
      "discriminator": [
        57,
        97,
        196,
        95,
        195,
        206,
        106,
        136
      ],
      "accounts": [
        {
          "name": "treasurer",
          "writable": true,
          "signer": true,
          "relations": [
            "treasury"
          ]
        },
        {
          "name": "treasury",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "newTreasurer",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "submitMove",
      "discriminator": [
        104,
        116,
        228,
        7,
        60,
        63,
        48,
        73
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "room",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "roomId",
          "type": "u64"
        },
        {
          "name": "hashedMove",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "room",
      "discriminator": [
        156,
        199,
        67,
        27,
        222,
        23,
        185,
        94
      ]
    },
    {
      "name": "treasury",
      "discriminator": [
        238,
        239,
        123,
        238,
        89,
        1,
        168,
        253
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "roomNotJoinable",
      "msg": "The room is not joinable."
    },
    {
      "code": 6001,
      "name": "cannotJoinOwnRoom",
      "msg": "Cannot join your own room."
    },
    {
      "code": 6002,
      "name": "notAPlayer",
      "msg": "You are not a player in this room."
    },
    {
      "code": 6003,
      "name": "roomNotReady",
      "msg": "The game is not ready yet."
    },
    {
      "code": 6004,
      "name": "invalidMoveReveal",
      "msg": "Invalid move reveal."
    },
    {
      "code": 6005,
      "name": "moveAlreadySubmitted",
      "msg": "Move already submitted."
    },
    {
      "code": 6006,
      "name": "incompleteGame",
      "msg": "The game is incomplete."
    },
    {
      "code": 6007,
      "name": "invalidMove",
      "msg": "Invalid move."
    },
    {
      "code": 6008,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to join the room."
    },
    {
      "code": 6009,
      "name": "wrongWinner",
      "msg": "Wrong Winner"
    },
    {
      "code": 6010,
      "name": "invalidTreasurer",
      "msg": "Invalid Treasurer"
    }
  ],
  "types": [
    {
      "name": "gameResult",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "player1Wins"
          },
          {
            "name": "player2Wins"
          },
          {
            "name": "draw"
          }
        ]
      }
    },
    {
      "name": "room",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roomId",
            "type": "u64"
          },
          {
            "name": "player1",
            "type": "pubkey"
          },
          {
            "name": "player2",
            "type": "pubkey"
          },
          {
            "name": "player1HashedMove",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "player2HashedMove",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "player1Move",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "player2Move",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "roomStatus"
              }
            }
          },
          {
            "name": "result",
            "type": {
              "option": {
                "defined": {
                  "name": "gameResult"
                }
              }
            }
          },
          {
            "name": "entryFee",
            "type": "u64"
          },
          {
            "name": "depositTotal",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "roomStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "waitingForPlayer"
          },
          {
            "name": "waitingForMoves"
          },
          {
            "name": "waitingForReveal"
          },
          {
            "name": "complete"
          }
        ]
      }
    },
    {
      "name": "treasury",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "treasurer",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
