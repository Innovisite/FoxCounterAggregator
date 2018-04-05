import { OrthographicCamera, Box2, Vector2, Vector3, Camera } from 'three';
import { MouseControlsBase, } from './MouseControlsBase';

const MAX_ZOOM_FACTOR = 0.5;

export class HeatMapControls extends MouseControlsBase {

    private cachedVector = new Vector2();

    private scopeMove: boolean;
    // bounds of the viewport area which represents the area we want to look at
    private bounds: Box2 = new Box2();
    // bounds of the ortho camera without zoom
    private orthoSize: Vector2 = new Vector2();
    private point: Vector3 = new Vector3();
    private zoom: number = 1;

    constructor(private camera: OrthographicCamera, params: any) {
        super(params.scope, params);

        this.camera = camera;

        this.params.zoomMin = params.zoomMin || 1;
        this.params.zoomMax = params.zoomMax || 4;

        this.scopeMove = this.params.stopOnLeave ? params.scope : document;

        this.setMouseSpeedFactor(0.0025);
        this.setTouchSpeedFactor(0.0025);
        this.setWheelSpeedFactor([0.05, 0.88, 0.05]);

        this.userInteraction = !this.params.clickToInteract;
        this.rebind();
        this.listen();
    }

    update() {
        if (this.enabled === false) return;
    }

    // we move only if there are some viewport's area outside the current container view
    // we try to move at a fixed rate (% of the viewport area), the mvt speed take into account
    // the ratio between the container and the ortho size and the zoom factor
    doMove(delta: any) {

        if (this.enabled === false) return;

        let px = delta.x < 0 ? this.bounds.min.x : this.bounds.max.x;
        let py = delta.y < 0 ? this.bounds.max.y : this.bounds.min.y;

        // project some of the viewport boundary coordinates on the container view (with normalized coords [-1;1])        
        // for example if we want to move up then we project the viewport top coordinate and check if the point is visible         
        this.point.set(px, py, 0).project(this.camera);

        const bSize = this.bounds.getSize(this.cachedVector); // todo: check for allocation optimization

        // a point outside the container means abs(coords) > 1  
        if (Math.abs(this.point.x) > 1) {
            this.camera.position.x += delta.x * bSize.x * (this.params.scope.offsetWidth / (this.orthoSize.x * this.zoom));
        }

        if (Math.abs(this.point.y) > 1) {
            this.camera.position.y -= delta.y * bSize.y * (this.params.scope.offsetHeight / (this.orthoSize.y * this.zoom));
        }
    }

    onMouseWheel(event: any) {

        if (this.enabled === false) return;

        if (this.params.zoomWheel) {
            event.preventDefault();
            // move in or out by 10%
            this.doZoom(event.deltaY < 0 ? 1.1 : 0.9);            
        }
    }

    private doZoom(factor: number) {
        const newZoom = this.zoom * factor;
        if (newZoom < this.params.zoomMax &&
            newZoom > this.params.zoomMin) {
            this.zoom = newZoom;
        } else if (newZoom <= this.params.zoomMin) {
            this.zoom = this.params.zoomMin;
        }
        this.updateBounds();
    }

    public zoomIn(factor: number): void {
        this.doZoom(1. + Math.min(MAX_ZOOM_FACTOR, factor));
    }

    public zoomOut(factor: number): void {
        // limit zoom factor to %50
        this.doZoom(1. - Math.min(MAX_ZOOM_FACTOR, factor));
    }

    public zoomReset(): void {
        this.zoom = this.params.zoomMin;
        this.updateBounds();
    }

    private updateBounds(): void {
        // the higher the zoom, the smaller the orthograhic area for the same container => zoom in
        this.camera.left = - this.orthoSize.x / (2 * this.zoom);
        this.camera.right = this.orthoSize.x / (2 * this.zoom);
        this.camera.top = this.orthoSize.y / (2 * this.zoom);
        this.camera.bottom = - this.orthoSize.y / (2 * this.zoom);
        // if we see all the viewport then reset the camera position
        if (this.camera.right - this.camera.left >= (this.bounds.max.x - this.bounds.min.x)) {
            this.camera.position.x = 0;
        }
        if (this.camera.top - this.camera.bottom >= (this.bounds.max.y - this.bounds.min.y)) {
            this.camera.position.y = 0;
        }
        this.camera.updateProjectionMatrix();
    }

    // compute orthographic bounds in order to view all the viewport into the container
    // @params viewport rectangular area [x0;y0] = bottomleft , [x1:y1]  = topright in cartesian coords
    public setViewport(x0: number, y0: number, x1: number, y1: number): void {
        this.bounds.min.x = x0;
        this.bounds.min.y = y0;
        this.bounds.max.x = x1;
        this.bounds.max.y = y1;

        const bSize = this.bounds.getSize(this.cachedVector);

        const ratioW = (bSize.x / this.params.scope.offsetWidth);
        const ratioH = (bSize.y / this.params.scope.offsetHeight);

        const maxRatio = Math.max(ratioW, ratioH);

        this.orthoSize.set(this.params.scope.offsetWidth * maxRatio, this.params.scope.offsetHeight * maxRatio);

        this.updateBounds();
    }

    public reset(): void {
        this.zoom = 1;
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.updateBounds();
    }

    rebind() {
        this.rebindAll();
    }

    listen() {

        this.rescopeBind('onMouseUp', this.scopeMove);
        this.rescopeBind('onMouseMove', this.scopeMove);
        this.rescopeBind('onTouchMove', this.scopeMove);

        this.listenAll();
    }

    dispose() {
        this.disposeAll();
    }
}