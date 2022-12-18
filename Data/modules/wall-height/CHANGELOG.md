# CHANGELOG

## [3.6.0.1] 2021 Nov 18

  - 9.0 compatability tweaks courtesy of theripper93
  - Spanish language updates courtesy lozalojo
  - 
## [3.6.0.0] 2021 Oct 5

  -  integrated support for token heights
  -  integrated Spanish language support
  -  integrated fix for PF1 system
 
## [3.5.3.9] 2021-06-08

  -  added support for Lichtgeschwindigkeit 1.3.0

## [3.5.3.5] 2021-06-08

  - Patch for 'Levels' support


## [3.5.3.4] 2021-03-13

### FIXED

  - Disabling wall-height for scene also disables tooltip
  - Tooltip now displays zero values properly
  - Scene on/off now registers properly as 'enabled' if never set (defaults to true)
  - Updated setElevation macro to support decimals
  
## [3.5.3.3] 2021-02-18

### CHANGED

  - Added setting to enable/disable tooltip
  - Edited tooltip to be less intrusive

### FIXED

  - Removed libwrapper from the 'testWall' core function, which gets called 10s of thousands of times and creates a perf hit
  - Corrected the way the tooltip was defined so that a 'phantom line' doesn't appear on the canvas

## [3.5.3] 2021-02-03

### CHANGED

  - Added libwrapper support
  - Modified macro to support multilevel tokens
  - added tooltip for wall layer
  
### FIXED

  - corrected some errors related to libwrapper shim file
  
## [3.5.0] 2021-02-06 - Taken over by Erithtotl

### FIXED

- Changed the .update calls to .refresh calls on layers and token to remove deprecated calls.

### CHANGED

  - Added movement above and below walls as well as vision
  - Added scene specific setting to enable/disable wall height (many scenes have no need for the feature)
  - Added Compendium and macro to enable bulk setting of token elevations for quick party transitions

## [3.0.1] 2020-12-16

### FIXED

- Fix an issue that would prevent the wall height fields from being shown in the wall config dialog if the user's language was not English. (Thank you capoeria for reporting this issue)

### CHANGED

- Add support for translations. Currently, only English is included, but PRs are accepted for translations.
- Dynamically recalculate wall config dialog height after injecting wall height fields (prevents scrollbar from showing).
- Bump core compatibility version to 0.7.8.

## [3.0.0] 2020-10-21

### CHANGED

- Ensure that wall height works correctly with the extensive sight calculation changes in 0.7

## [2.0.2] 2020-10-10

### FIXED

- Fix an issue that would cause the wall height fields to appear multiple times in the wall config dialog, creating invalid wall heights. (thank you Exitalterego for the pull request)

## [2.0.1] 2020-07-28

### CHANGED

- Made some changes to reduce likelihood of errors caused by changing function signatures (Once again thanks to @ruipin).

## [2.0.0] 2020-07-27

### CHANGED

- Massively refactor how functions are patched, which will hopefully decrease the possibility of conflicts in the future (HUGE thanks to @ruipin for the help with this).

## [1.0.5] 2020-07-26

### FIXED

- Fix an issue that would prevent the canvas from rendering if dynamic effects was not installed.

## [1.0.4] 2020-07-25

### ADDED

- Add compatibility support for Dynamic Effects "Player Controls Invisible Tokens" setting.

## [1.0.3] 2020-07-20

### ADDED

- Add compatibility support for "No Summon Vision" (<https://github.com/schultzcole/FVTT-No-Summon-Vision>).

## [1.0.2] 2020-07-13

### FIXED

- Fixed an issue where custom token darkvision properties added in the PF1 and D35E systems were not being included because of a patch conflict.

## [1.0.1] 2020-07-12

### FIXED

- Fixed an issue where the light emission of a token was always considered to be at height zero. This resulted in a confusing user experience where a token could only see through a wall when the minimum height was greater than 0.

## [1.0.0] 2020-07-07

The 1.0.0 update introduces a breaking change. Walls that have been set up with wall height will need to be set up again. [A macro](/macros/0.1.0_to_1.0.0_migration.js) is provided that can perform the migration automatically.

Despite being version 1.0.0, this module is _still_ in a pre-release status. Use at your own risk.

### FIXED

- Improved performance issues with large numbers of walls.

## [0.1.0] 2020-07-05

### ADDED

- Add top and bottom height for walls.
