import { AddressType, Wallet, bitcoin } from "./bitcoin"
import { Psbt } from "bitcoinjs-lib"

describe("Market Buy/Sell", () => {
  // replace with your own private key
  const wif = "cS4VkNdu4LJKzv9kQ4Um93f8NU43tBiqkZqVWKsGWi1qLzczrdvw"
  // replace with your own network
  const network = bitcoin.networks.testnet
  // replace with your own fee rate

  it("test sign buyer payload", async () => {
    const psbt = Psbt.fromBase64(
      "cHNidP8BAPYCAAAAArBtbdLTej9ve6BbO8xVxkfTKh4eSy0LCKxBTTFyapR8AQAAAAD/////qF73obkmPIAuvbPRMU6H0dkQeOKZqQX08NZ8US1VHU8CAAAAAP////8EsAQAAAAAAAAiUSCMC4kWN4fOjlzj8SYnRQJMkabkiK+4n4OmzKqk22SxNQAAAAAAAAAAEGpdDRYAAK/inQEkgMLXLwMAAAAAAAAAACJRINApSOPBH5A1wuIlwyVyLZcB0QIMDtf4/lMgwXxW6u1pFBsAAAAAAAAiUSCNwVdqTPNKMx2R2F1EcXPJfDC07y7kuquerWI33UsJ2AAAAAAAAQCBAQAAAAGWgbUU2qgcRbtUnAH8caxrd73Sdlc6oJs/5m1XD6J2eQAAAAAA/f///wIAAAAAAAAAABpqXRcCAQTMrZDh2ODhFgEBA6ICBoDC1y8WAQEAAAAAAAAAIlEgjAuJFjeHzo5c4/EmJ0UCTJGm5IivuJ+DpsyqpNtksTUAAAAAAQErAQAAAAAAAAAiUSCMC4kWN4fOjlzj8SYnRQJMkabkiK+4n4OmzKqk22SxNQABAPACAAAAAAEBNc/aUqEcllPESNFYLCtw130PQ7PmeIdnMzHBlfXz1OMAAAAAAP3///8DAAAAAAAAAAAaagFSFgIDBIf1NwEBBUgGnIykk58AAADNEAEBAAAAAAAAACJRII3BV2pM80ozHZHYXURxc8l8MLTvLuS6q56tYjfdSwnYDh0AAAAAAAAiUSCNwVdqTPNKMx2R2F1EcXPJfDC07y7kuquerWI33UsJ2AFATC5v1RanxtB8IWQKpQIGjl0lXvEMo24GUeCDA7Wx0VITDVuDz8LYrxLHuTDTbhs7XXQUAjg3cscI1JhU6nUS0AAAAAAAAAAAAA==",
    )

    let addressType = AddressType.P2TR
    let wallet = new Wallet(wif, network, addressType)
    const signed = wallet.signPsbt(psbt)

    console.log("signed :>> ", signed.toBase64())
  })
})
