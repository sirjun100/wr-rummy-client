import { _decorator, Component, Asset, assetManager, Button, color, director, EditBox, game, HorizontalTextAlignment, Input, Label, macro, native, Node, ProgressBar, Sprite, SpriteFrame, sys, ToggleContainer, tween, v3, Vec3, Widget } from "cc";
import { AbstractController, IArchitecture } from "../../framework/QFramework";
import { GameApp } from "../GameApp";

const { ccclass, property } = _decorator;
@ccclass("MainController")
export class MainController extends  AbstractController{

    @property(Label)
    public txtHello: Label = null;

    public GetArchitecture(): IArchitecture {
        return GameApp.Interface;
    }
    
}
