FILES="StakingAura"
for f in $FILES
do
temp_file=$(mktemp)
cat build/contracts/$f.json | jq -r '.abi' > $temp_file.abi
cat build/contracts/$f.json | jq -r '.bytecode' > $temp_file.bin
abigen --abi $temp_file.abi --bin $temp_file.bin --pkg stakingcontract --out $f.go
rm $temp_file.*
done
