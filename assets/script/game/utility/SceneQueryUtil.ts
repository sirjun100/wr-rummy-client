import { director } from "cc";

export class SceneQueryUtil {
    public static IsCurrentScene(sceneName: string): boolean {
        const scene = director.getScene();
        return scene != null && scene.name === sceneName;
    }
}
