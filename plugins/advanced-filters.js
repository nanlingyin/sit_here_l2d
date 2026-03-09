/**
 * 高级滤镜系统
 * Advanced Filters for Enhanced Lighting Effects
 *
 * 提供更高级的光照效果：
 * 1. 方向性阴影
 * 2. 环境反射高光
 * 3. 深度感知光照（结合现有蒙版系统）
 */

export class AdvancedFilters {
  /**
   * 创建方向性阴影滤镜（自定义 WebGL Shader）
   */
  static createDirectionalShadowFilter() {
    const vertexSrc = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      uniform mat3 projectionMatrix;
      varying vec2 vTextureCoord;

      void main(void) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
      }
    `;

    const fragmentSrc = `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform vec2 lightDirection; // 光源方向（归一化）
      uniform float shadowIntensity; // 阴影强度 0-1
      uniform float shadowOffset; // 阴影偏移距离

      void main(void) {
        vec4 color = texture2D(uSampler, vTextureCoord);

        // 计算阴影偏移位置
        vec2 shadowCoord = vTextureCoord + lightDirection * shadowOffset;

        // 采样阴影位置的 alpha（用于判断是否在阴影中）
        float shadowAlpha = texture2D(uSampler, shadowCoord).a;

        // 如果当前像素透明但阴影位置不透明，说明在阴影区域
        float shadowFactor = (1.0 - color.a) * shadowAlpha * shadowIntensity;

        // 应用阴影（降低亮度）
        color.rgb *= (1.0 - shadowFactor * 0.5);

        gl_FragColor = color;
      }
    `;

    const filter = new PIXI.Filter(vertexSrc, fragmentSrc, {
      lightDirection: [0.0, -1.0],
      shadowIntensity: 0.3,
      shadowOffset: 0.01
    });

    return filter;
  }

  /**
   * 创建环境反射高光滤镜
   */
  static createEnvironmentReflectionFilter() {
    const vertexSrc = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      uniform mat3 projectionMatrix;
      varying vec2 vTextureCoord;

      void main(void) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
      }
    `;

    const fragmentSrc = `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform vec3 highlightColor; // 高光颜色 RGB
      uniform float highlightIntensity; // 高光强度
      uniform vec2 highlightPosition; // 高光中心位置（归一化 0-1）
      uniform float highlightRadius; // 高光半径

      void main(void) {
        vec4 color = texture2D(uSampler, vTextureCoord);

        // 计算到高光中心的距离
        float dist = distance(vTextureCoord, highlightPosition);

        // 计算高光衰减（高斯分布）
        float highlight = exp(-dist * dist / (highlightRadius * highlightRadius));
        highlight *= highlightIntensity;

        // 应用高光（叠加模式）
        color.rgb += highlightColor * highlight * color.a;

        gl_FragColor = color;
      }
    `;

    const filter = new PIXI.Filter(vertexSrc, fragmentSrc, {
      highlightColor: [1.0, 1.0, 0.9],
      highlightIntensity: 0.2,
      highlightPosition: [0.5, 0.3],
      highlightRadius: 0.3
    });

    return filter;
  }

  /**
   * 创建边缘光滤镜（Rim Lighting）
   */
  static createRimLightFilter() {
    const vertexSrc = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      uniform mat3 projectionMatrix;
      varying vec2 vTextureCoord;

      void main(void) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
      }
    `;

    const fragmentSrc = `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform sampler2D uSampler;
      uniform vec3 rimColor; // 边缘光颜色
      uniform float rimIntensity; // 边缘光强度
      uniform vec2 lightDirection; // 光源方向
      uniform vec2 texelSize; // 纹理像素大小

      void main(void) {
        vec4 color = texture2D(uSampler, vTextureCoord);

        // 采样周围像素检测边缘
        float alpha = color.a;
        float alphaUp = texture2D(uSampler, vTextureCoord + vec2(0.0, texelSize.y)).a;
        float alphaDown = texture2D(uSampler, vTextureCoord - vec2(0.0, texelSize.y)).a;
        float alphaLeft = texture2D(uSampler, vTextureCoord - vec2(texelSize.x, 0.0)).a;
        float alphaRight = texture2D(uSampler, vTextureCoord + vec2(texelSize.x, 0.0)).a;

        // 检测边缘（alpha 梯度）
        float edge = abs(alpha - alphaUp) + abs(alpha - alphaDown) +
                     abs(alpha - alphaLeft) + abs(alpha - alphaRight);
        edge = clamp(edge * 2.0, 0.0, 1.0);

        // 计算光照方向影响（边缘光只在背光面）
        vec2 normalizedCoord = vTextureCoord * 2.0 - 1.0;
        float lightDot = dot(normalize(normalizedCoord), lightDirection);
        float rimFactor = max(0.0, -lightDot); // 背光面

        // 应用边缘光
        vec3 rim = rimColor * edge * rimFactor * rimIntensity;
        color.rgb += rim * alpha;

        gl_FragColor = color;
      }
    `;

    const filter = new PIXI.Filter(vertexSrc, fragmentSrc, {
      rimColor: [1.0, 1.0, 0.9],
      rimIntensity: 0.5,
      lightDirection: [0.0, -1.0],
      texelSize: [1.0 / 1024, 1.0 / 768]
    });

    return filter;
  }

  /**
   * 更新滤镜参数
   */
  static updateFilterUniforms(filter, uniforms) {
    if (!filter || !filter.uniforms) return;
    Object.assign(filter.uniforms, uniforms);
  }
}
