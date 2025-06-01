attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

uniform float timeFactor;
// Pre-generated random values passed from JavaScript
uniform float randomSeed1;
uniform float randomSeed2; 
uniform float randomSeed3;
uniform float randomSeed4;

void main() {
   
    float randomOffset1 = randomSeed1 + aTextureCoord.x * 2.0 + aTextureCoord.y * 1.5;
    float randomOffset2 = randomSeed2 + aTextureCoord.y * 2.5 + aTextureCoord.x * 1.8;
    
    vTextureCoord = aTextureCoord + vec2(
        timeFactor * 0.01 + sin(randomOffset1) * 0.005, 
        0.0
    );

    float height = texture2D(uSampler2, aTextureCoord + vec2(
        timeFactor * 0.02 + cos(randomOffset2) * 0.01, 
        0.0
    )).r;
    
    
    float heightOffset = 0.5 * sin(timeFactor * 0.3 + randomSeed3);
    
    
    float distanceFromTop = (1.0 - aVertexPosition.x) * 0.5; // 0 at top, 1 at bottom
    
    
    float xOffset = heightOffset * (1.0 - distanceFromTop);
    
   
    vec3 scaledPosition = vec3(aVertexPosition.x + xOffset, aVertexPosition.y, aVertexPosition.z);
    
    
    vec3 displacedPosition = scaledPosition + vec3(
        0.0, 
        0.0, 
        height * 0.15 * (1.0 + 0.5 * sin(timeFactor * 0.03 + randomSeed4))
    );

    gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);
}