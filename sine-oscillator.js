class SineOscillatorProcessor extends AudioWorkletProcessor {
    w = 0
    vibW = 0
    PIF = 2 * Math.PI / 44100

    constructor() {
      super()
    }
  
    static get parameterDescriptors() {
      return [
        {
          name: "f",
          defaultValue: 1000.0,
          minValue: 20.0,
          maxValue: 20000.0,
        },
        {
          name: "vibF",
          defaultValue: 5.0,
          minValue: 0.1,
          maxValue: 20000.0,
        },
        {
          name: "vibA",
          defaultValue: 5.0,
          minValue: 0.0,
          maxValue: 20000.0,
        },
      ]
    }
    
    process(inputList, outputList, parameters) {
        const f = parameters.f[0]
        const vibF = parameters.vibF[0]
        const vibA = parameters.vibA[0]
        let dw = f * this.PIF  
        let vibDw = vibF * this.PIF
        let output = outputList[0];
        let sampleCount = output[0].length;

        for (let i = 0; i < sampleCount; i++) {
            this.w += dw
            this.vibW += vibDw
            output[0][i] = 0.1 * Math.sin(this.w + vibA * Math.sin(this.vibW))
        }
        return true;
    }
}
  
registerProcessor("sine-oscillator", SineOscillatorProcessor);