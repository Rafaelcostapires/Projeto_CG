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

void main() {

    vTextureCoord = aTextureCoord + vec2(timeFactor * 0.01, 0.0);

 	float height = texture2D(uSampler2, aTextureCoord + vec2(timeFactor * 0.02, 0.0)).r;	
	vec3 displacedPosition = aVertexPosition + vec3(0.0, 0.0, height * 0.08);

	gl_Position = uPMatrix * uMVMatrix * vec4(displacedPosition, 1.0);

}

