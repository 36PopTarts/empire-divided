import * as MODULE from "../lockview.js";
import * as CBUTTONS from "./controlButtons.js";
import * as MISC from "./misc.js";
import * as BLOCKS from "./blocks.js";
import * as VIEWBOX from "./viewbox.js";

export var viewboxStorage; 
export var viewbox = [];

/*
 * Viewbox class that draws the viewbox
 */
export class Viewbox extends CanvasLayer {
  constructor() {
    super();
    this.init();
    this.moveLocation;
    this.scaleLocation;
    this.boxWidth;
    this.boxHeight;
    this.boxColor;
    this.boxName;
    this.xStorage;
    this.yStorage;
    this.userId;
    this.moveOffset = 0;
    this.scaleOffset = 0;
    this.screenWidth;
  }

  init() {
    this.container = new PIXI.Container();
    this.addChild(this.container);
  }

  async draw() {
    super.draw();
  }

  /*
   * Update the viewbox
   */
  updateViewbox(data) {
    const x = data.x - Math.floor(data.width / 2);
    const y = data.y - Math.floor(data.height / 2);

    this.moveLocation = {x:x-20, y:y-20};
    this.scaleLocation = {x:x+data.width+20, y:y+data.height+20};
    this.boxWidth = data.width;
    this.boxHeight = data.height;
    this.boxColor = data.color;
    this.boxName = data.name;
    this.xStorage = x;
    this.yStorage = y;
    this.screenWidth = data.screenWidth;
    if (this.userId == undefined) this.userId = data.id;

    this.container.removeChildren();
    var drawing = new PIXI.Graphics();
    //rect.cacheAsBitmap = true;
    drawing.lineStyle(2, data.color, 1);
    drawing.drawRect(0,0,data.width,data.height);
    this.container.addChild(drawing);

    if (canvas.scene.getFlag('LockView', 'editViewbox')){
      this.moveOffset = 0;
      this.scaleOffset = 0;
      //Check if the location of the moveButton and scaleButton is already occupied by another button
      if (data.controlBtn != true)
        for (let i=0; i<VIEWBOX.viewbox.length; i++){
          
          const viewbox = VIEWBOX.viewbox[i];
          if (viewbox == undefined || viewbox.boxName == data.name) continue;
          
          if (Math.abs(viewbox.moveLocation.x - this.moveLocation.x) <= 40 && Math.abs(viewbox.moveLocation.y - this.moveLocation.y) <= 40) {
            this.moveOffset += 50-Math.abs(viewbox.moveLocation.y - this.moveLocation.y);
            this.moveLocation.y += 50-Math.abs(viewbox.moveLocation.y - this.moveLocation.y);
          }
          if (Math.abs(viewbox.scaleLocation.x - this.moveLocation.x) <= 40 && Math.abs(viewbox.scaleLocation.y - this.moveLocation.y) <= 40) {
            this.moveOffset += 50-Math.abs(viewbox.scaleLocation.y - this.moveLocation.y);
            this.moveLocation.y += 50-Math.abs(viewbox.scaleLocation.y - this.moveLocation.y);
          }

          if (Math.abs(viewbox.moveLocation.x - this.scaleLocation.x) <= 40 && Math.abs(viewbox.moveLocation.y - this.scaleLocation.y) <= 40) {
            this.scaleOffset -= 50-Math.abs(viewbox.moveLocation.y - this.scaleLocation.y);
            this.scaleLocation.y -= 50-Math.abs(viewbox.moveLocation.y - this.scaleLocation.y);
          }
          if (Math.abs(viewbox.scaleLocation.x - this.scaleLocation.x) <= 40 && Math.abs(viewbox.scaleLocation.y - this.scaleLocation.y) <= 40) {
            this.scaleOffset -= 50-Math.abs(viewbox.scaleLocation.y - this.scaleLocation.y);
            this.scaleLocation.y -= 50-Math.abs(viewbox.scaleLocation.y - this.scaleLocation.y);
          }
        }

      var drawingCircles = new PIXI.Graphics();
      drawingCircles.lineStyle(2, data.color, 1);
      drawingCircles.beginFill(data.color);
      drawingCircles.drawCircle(-20,-20+this.moveOffset,20);
      drawingCircles.drawCircle(data.width+20,data.height+20+this.scaleOffset,20);
      this.container.addChild(drawingCircles);

      var moveIcon = PIXI.Sprite.from('modules/LockView/img/icons/arrows-alt-solid.png');
      moveIcon.anchor.set(0.5);
      moveIcon.scale.set(0.25);
      moveIcon.position.set(-20,-20+this.moveOffset)
      this.container.addChild(moveIcon);

      var scaleIcon = PIXI.Sprite.from('modules/LockView/img/icons/compress-arrows-alt-solid.png');
      scaleIcon.anchor.set(0.5);
      scaleIcon.scale.set(0.20);
      scaleIcon.position.set(data.width+20,data.height+20+this.scaleOffset)
      this.container.addChild(scaleIcon);
    }
      
    var label = new PIXI.Text(data.name, {fontFamily : 'Arial', fontSize: 24, fontWeight : 'bold', fill : data.color, align : 'center'});
    label.anchor.set(0.5);
    label.position.set(data.width / 2,-15)
    this.container.addChild(label);
    
    this.container.setTransform(x, y);
    this.container.visible = true;
  }
  
  /*
   * Hide the viewbox
   */
  hide() {
    this.container.visible = false;
  }

  /*
   * Show the viewbox
   */
  show() {
    this.container.visible = true;
  }

  /*
   * Remove the viewbox
   */
  remove() {
    this.container.removeChildren();
  }
}

/*
 * Find the correct values for the viewbox, and update the viewbox
 */
export function drawViewbox(payload){
  if (game.user.isGM == false || CBUTTONS.mouseMode != null) return;
  viewboxStorage = payload;
  if(game.settings.get("LockView","viewbox")){
    let senderNumber;
    let senderNumbers = Array.from(game.users);
    //get index of the sending user
    for (let i=0; i<senderNumbers.length; i++)
      if (senderNumbers[i].data._id == payload.senderId)
        senderNumber = i;
    //check if sending user is in same scene, if not, hide viewbox and return
    if (payload.sceneId != canvas.scene.data._id) {
      if(viewbox[senderNumber] != undefined)
        viewbox[senderNumber].hide();
      return;
    }
    
    //If viewbox doesn't exist for player, create it
    if (viewbox[senderNumber] == undefined){
      viewbox[senderNumber] = new Viewbox();
      canvas.stage.addChild(viewbox[senderNumber]);
      viewbox[senderNumber].init();
    }
    //update viewbox
    viewbox[senderNumber].updateViewbox(
      {
        x: payload.viewPosition.x,
        y: payload.viewPosition.y,
        width: payload.viewWidth/payload.viewPosition.scale,
        height: payload.viewHeight/payload.viewPosition.scale,
        color: parseInt(payload.senderColor.replace(/^#/, ''), 16),
        name: payload.senderName,
        id: payload.senderId,
        screenWidth: payload.viewWidth
      }
    );
  }
}

/*
 * Hide all viewboxes
 */
export function hideAllViewboxes(){
  if (game.user.isGM) {
    for (let i=0; i< viewbox.length; i++)
      if (viewbox[i] != undefined)
        viewbox[i].hide();
  }
}

/*
 * Initialize viewboxes
 */
export function initializeViewboxes(users){
  for (let i=0; i<users.length; i++){
    if(viewbox[i] == undefined){
      viewbox[i] = new Viewbox();
      canvas.stage.addChild(viewbox[i]);
      viewbox[i].init();
    }
  }
}

/*
 * Returns whether the viewbox is enabled for a user
 */
export function getViewboxEnable(userId){
  const settings = game.settings.get("LockView","userSettings");

  //Check if the userId matches an existing id in the settings array
  for (let i=0; i<settings.length; i++)
    if (settings[i].id == userId) return settings[i].viewbox;

  //Else return true for new players, return false for new GMs
  const userList = game.users.entries;
  for (let i=0; i<userList.length; i++){
    if (userList[i]._id == userId && userList[i].role != 4)
      return true;
  }
  return false;
}

/*
 * Send viewbox data to the GM to draw the viewbox
 */
export function sendViewBox(viewPosition=null){
  if (getViewboxEnable(game.userId)==false) return;
  if (canvas.scene == null || canvas.scene == undefined) return;
  if (viewPosition == null) viewPosition=canvas.scene._viewPosition;
  
  //get all flags
  BLOCKS.getFlags();

  //New viewbox data
  let viewPositionNew = {
    x: viewPosition.x,
    y: viewPosition.y,
    scale: viewPosition.scale
  }

  //Sidebar offset
  let offset = 0;
  if (ui.sidebar._collapsed == false && BLOCKS.excludeSidebar && BLOCKS.blackenSidebar){
    offset = (window.innerWidth-ui.sidebar._element[0].offsetLeft);
    viewPositionNew.x -= offset/(2*viewPosition.scale);
  }

  const payload = {
    "msgType": "viewbox",
    "senderId": game.userId, 
    "senderName": game.user.name,
    "senderColor": game.user.color,
    "receiverId": game.data.users.find(users => users.role == 4)._id, 
    "sceneId": canvas.scene.data._id,
    "viewPosition": viewPositionNew,
    "viewWidth": window.innerWidth-offset,
    "viewHeight": window.innerHeight
  };
  game.socket.emit(`module.LockView`, payload);
}

/*
 * Request viewbox data from connected users
 */
export function getViewboxData(){
    let payload = {
      "msgType": "getViewboxData",
      "senderId": game.userId
    };
    game.socket.emit(`module.LockView`, payload);
}