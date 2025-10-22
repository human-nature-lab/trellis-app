# This uses the dieharder test program to validate the randomness of our PRNG implementations

bun run ./write-files.ts

dieharder -a -g 201 -f jsf32b.bin