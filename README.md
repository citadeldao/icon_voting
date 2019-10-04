# Icon Power Vote
Icon auto-voting app

![screenshot](https://github.com/cybor97/icon_voting/blob/master/Selection_518.png)


# Build
1. `git clone https://github.com/cybor97/icon_voting`
2. `sudo npm i -g yarn`
3. `yarn install`
4. `npm rebuild`
5. `yarn start` (to debug)
6. `yarn build` (to build app, executables will be generated in /dist folder, provide `--linux`, `--mac` or `--windows` to build for specified environment)

# Run
Start executable(or debug), input keystore and password(credentials will be stored in localStorage) and click "Start".
You'll need to set percents of votes. 
Voting process starts strictly once per day(starting next day) if app is running, so there's a sense to set autorun.

# Issues
## Error: Module did not self-register.
Somehow electron-builder breaks scss in build cache.
Just run `npm run rebuild`.