export interface SerialisedEvent {
    type: string;
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    timeStamp: number;
    xpath: string;
}
export declare const isTouchEvent: (event: MouseEvent | TouchEvent) => event is TouchEvent;
export declare const isMouseEvent: (event: MouseEvent | TouchEvent) => event is MouseEvent;
export declare const rehydrateSerialisedEvent: (event: SerialisedEvent) => (() => TouchEvent) | (() => MouseEvent);
export declare const serialiseEvent: (e: MouseEvent | TouchEvent, startTimeStamp: number) => SerialisedEvent;
