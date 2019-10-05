# Icon Power Vote
Icon auto voting app by Paradigm Citadel. You can use this tool to automate daily voting process.

![screenshot1](https://github.com/paradigmcitadel/icon_voting/blob/master/screens/1.PNG)
![screenshot2](https://github.com/paradigmcitadel/icon_voting/blob/master/screens/2.PNG)

# Tutorial
1) Add your keystore file 
2) Set percent for selected P-reps
3) Run 

# Release 
[Windows](https://github.com/paradigmcitadel/icon_voting/releases/download/0.1.1/Icon.Power.Vote.Setup.0.1.1.exe)
[Mac](https://github.com/paradigmcitadel/icon_voting/releases/download/0.1.1/Icon.Power.Vote-0.1.1.dmg) 
Linux([Appimge](https://github.com/paradigmcitadel/icon_voting/releases/download/0.1.1/Icon.Power.Vote-0.1.1.AppImage)/[Snap](https://github.com/paradigmcitadel/icon_voting/releases/download/0.1.1/icon_voting_0.1.1_amd64.snap))

# Requirements
1. NodeJS 10+
2. Python 2.7.* for Windows

# Build
1. `git clone https://github.com/paradigmcitadel/icon_voting`
2. `sudo npm i -g yarn` (without sudo for windows)
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
