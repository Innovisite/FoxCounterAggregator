import {
    PerspectiveCamera, LinearFilter, WebGLRenderer,
    OrthographicCamera, Matrix4,
    Mesh, Scene, WebGLRenderTarget,
    Texture, PlaneBufferGeometry,
    NearestFilter, ClampToEdgeWrapping
} from 'three';

import { HeatColorMaterial } from './HeatColorMaterial';
import { HeatIntensityMaterial } from './HeatIntensityMaterial';
import { HeatMapBufferGeometry } from './HeatMapGeometry';

export class HeatMapMesh extends Mesh {

    public needsUpdate: boolean;

    private fbCamera: OrthographicCamera;
    private fbScene: Scene;
    private fbRenderer: WebGLRenderTarget;
    private hmComputeOptions: any;
    private computeFunction: string;
    private intensityMaterial: HeatIntensityMaterial;

    constructor(width: number, height: number, hmComputeOptions?: any, gradientTexture?: Texture) {
        super();

        this.needsUpdate = true;

        this.hmComputeOptions = hmComputeOptions;

        this.fbCamera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 1);

        this.fbScene = new Scene();
        this.fbRenderer = new WebGLRenderTarget(width, height);

        this.material = new HeatColorMaterial(this.fbRenderer.texture, gradientTexture, [0.0, 1.0, 0.5]);
        this.geometry = new PlaneBufferGeometry(width, height, 1, 1);

        this.intensityMaterial = new HeatIntensityMaterial(hmComputeOptions);
    }

    public clear(): void {
        this.fbScene.children.forEach((mesh: Mesh) => {            
            mesh.geometry.dispose();
            this.fbScene.remove(mesh);
        });
        this.needsUpdate = true;
    }

    public setOpacity(opacity: number): void {
        (<HeatColorMaterial>this.material).setOpacity(opacity);
    }

    public setHeatMapData(data: any[], transform?: number[]): void {
        this.clear();
        this.addHeatMapData(data, transform);
    }

    public addHeatMapData(data: any[], transform?: number[]): void {
        let mesh = new Mesh(new HeatMapBufferGeometry(data), this.intensityMaterial);
        if(transform) {
            let mat = new Matrix4().fromArray(transform);
            mesh.applyMatrix(mat);            
        }
        this.fbScene.add(mesh);
        this.needsUpdate = true;
    }

    public setVisible(v: boolean): void {
        this.visible = v;
        this.needsUpdate = true;
    }

    public setGradient(gradientTexture?: Texture) {
        this.material = new HeatColorMaterial(this.fbRenderer.texture, gradientTexture, [0.0, 1.0, 0.5]);
    }

    public update(renderer: WebGLRenderer): void {
        if (this.needsUpdate) {
            if (this.fbRenderer.width === 0) {
                this.setSize(renderer.getSize().width, renderer.getSize().height);
            }
            renderer.render(this.fbScene, this.fbCamera, this.fbRenderer, true);
            this.needsUpdate = false;
        }
    }

    public setSize(width: number, height: number) {
        this.needsUpdate = true;
    }
}