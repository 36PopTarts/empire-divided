import * as BLOCKS from "./blocks.js";
import * as CBUTTONS from "./controlButtons.js";

export var controlledTokens = [];

export async function setLockView(data) {
  let enable;
  if (data.panLock != undefined) {
    if (data.panLock == 'toggle') enable = !canvas.scene.getFlag('LockView', 'lockPan');
    else enable = data.panLock;
    ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "PanLock").active = enable;
    await BLOCKS.updatePanLock(enable);
  }
  if (data.zoomLock != undefined) {
    if (data.zoomLock == 'toggle') enable = !canvas.scene.getFlag('LockView', 'lockZoom');
    else enable = data.zoomLock;
    ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "ZoomLock").active = enable;
    await BLOCKS.updateZoomLock(enable);
  }
  if (data.boundingBox != undefined) {
    if (data.boundingBox == 'toggle') enable = !canvas.scene.getFlag('LockView', 'boundingBox');
    else enable = data.boundingBox;
    ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "BoundingBox").active = enable;
    await BLOCKS.updateBoundingBox(enable);
  }
  if (data.viewbox != undefined) {
    if (data.viewbox == 'toggle') enable = !game.settings.get("LockView","viewbox");
    else enable = data.viewbox;
    ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "Viewbox").active = enable;
    await CBUTTONS.viewbox(enable);
  }
  await ui.controls.render();
  if (data.editViewbox != undefined) {
    if (data.editViewbox == 'toggle') enable = !canvas.scene.getFlag('LockView', 'editViewbox');
    else enable = data.editViewbox;
    await CBUTTONS.editViewboxConfig(ui.controls.controls);
  }
}

/*
 * Get all tokens that are controlled by the player and store them into the 'controlledTokens' array
 */
export function getControlledTokens(){
  if (game.user.isGM) return;
  //Get a list of all tokens that are controlled by the user
  controlledTokens = [];
  const tokens = canvas.tokens.children[0].children;
  for (let i=0; i<tokens.length; i++){
    //Get the permissions of each token
    let defaultPermission = tokens[i].actor.data.permission.default;
    let userPermission = tokens[i].actor.data.permission?.[game.userId];
    if (userPermission == undefined) userPermission = defaultPermission;

    if (userPermission > 2) 
      controlledTokens.push(tokens[i]);
  }
  return controlledTokens;
}

/*
 * Get whether the module is enabled for the user
 */
export function getEnable(userId){
  const settings = game.settings.get("LockView","userSettings");

  //Check if the userId matches an existing id in the settings array
  for (let i=0; i<settings.length; i++)
    if (settings[i].id == userId) return settings[i].enable;

  //Else return true for new players, return false for new GMs
  const userList = game.users.entries;
  for (let i=0; i<userList.length; i++){
    if (userList[i]._id == userId && userList[i].role != 4)
      return true;
  }
  return false;
}

export function updatePopup(){
  if (game.settings.get("LockView","updatePopupV1.3.2") == false && game.user.isGM) {
    let d = new Dialog({
      title: "Lock View update v1.4.0",
      content: `
      <h3>Lock View has been updated to version 1.4.0</h3>
      <p>
      The 'Enable' and 'Force Enable' module settings have been removed, in favor or a 'User Configuration' screen that you will find in the module settings.<br>
      <br>
      <b>The old enable settings no longer work, you need to set them up in the new User Configuration screen in the Module Settings</b><br>
      <br>
      <input type="checkbox" name="hide" data-dtype="Boolean">
      Don't show this screen again
      </p>`,
      buttons: {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: "OK"
      }
      },
      default: "OK",
      close: html => {
        if (html.find("input[name ='hide']").is(":checked")) game.settings.set("LockView","updatePopupV1.3.2",true);
      }
    });
    d.render(true);
  }
  if (game.settings.get("LockView","updatePopupV1.4.3") == false && game.user.isGM) {
    let d = new Dialog({
      title: "Lock View update v1.4.3",
      content: `
      <h3>Lock View has been updated to version 1.4.3</h3>
      <p>
      In the scene configuration you'll find a new 'Autoscale' option: 'Automatic Fit (outside)'<br>
      This option allows you to autoscale the view in such a way that the whole canvas is always visible, instead of zooming in to fit like it did with the old 'Automatic Fit'. This function is
      still there by setting it to 'Automatic Fit (inside)'.<br>
      <br>
      <b>Due to this change, any scene that you had configured with 'Autoscale: Physical Gridscale' is now set to 'Automatic Fit (outside)'. Unfortunately you'll have to manually reconfigure those scenes.</b>
      <br>
      <input type="checkbox" name="hide" data-dtype="Boolean">
      Don't show this screen again
      </p>`,
      buttons: {
      ok: {
        icon: '<i class="fas fa-check"></i>',
        label: "OK"
      }
      },
      default: "OK",
      close: html => {
        if (html.find("input[name ='hide']").is(":checked")) game.settings.set("LockView","updatePopupV1.4.3",true);
      }
    });
    d.render(true);
  }
}

/*
 * Blacken or remove blackening of the sidebar background
 */
export function blackSidebar(en){
  if (en) document.getElementById("sidebar").style.backgroundColor = "black";
  else document.getElementById("sidebar").style.backgroundColor = "";
}