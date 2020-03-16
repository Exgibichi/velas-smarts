# Velas proof-of-stake setup

This is an integration test of AuRa POSDAO with seven Parity nodes running locally.


## Usage

To generate spec file run `npm run make-spec`.
To compile contracts `npm run compile-posdao-contracts`.
To run specific script `node scripts/<script-name>.js`

To sign transactions copy key files to ./accounts/keystore directory and type keystore password to ./config/password.

## Requirements

To integrate with [parity-ethereum](https://github.com/paritytech/parity-ethereum), the following structure of folders is assumed:
```
.
├── parity-ethereum
├── this repo
```
So there should be two folders on the same level and `posdao-test-setup` will use parity binary from the `parity-ethereum` folder, namely the binary is assumed to be at `../parity-ethereum/target/release/parity` relative to `posdao-test-setup` root.

If you are working on modifications of `parity-ethereum` or want to compile specific branch/version, you can clone it directly and build the binary
```bash
# move up from repo root
cd ..
git clone https://github.com/paritytech/parity-ethereum
cd parity-ethereum
#
# Next step assumes you have Rust and required dependencies installed,
# for details please check https://github.com/paritytech/parity-ethereum/blob/master/README.md
# Note that you can instruct Rust to always use the latest stable version for this project by running
#     $ rustup override set stable
# in `parity-ethereum` folder.
#
# Build the binary
cargo build --release --features final
```

To save time, you can download a pre-compiled binary from the [releases page](https://github.com/paritytech/parity-ethereum/releases). But you still need to maintain directory structure and naming conventions:
```bash
# move up from repo root
cd ..
mkdir -p parity-ethereum/target/release/
curl -SfL 'https://releases.parity.io/ethereum/stable/x86_64-apple-darwin/parity' -o parity-ethereum/target/release/parity
chmod +x parity-ethereum/target/release/parity
# check that it works and version is correct (compare the version from the binary with version on the release page)
parity-ethereum/target/release/parity --version
```
