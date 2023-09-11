class OutputProcessor extends AudioWorkletProcessor {
    constructor() {
      super()
    }
  
    static get parameterDescriptors() {
      return [
        {
          name: "volume",
          defaultValue: 0.1,
          minValue: 0.0,
          maxValue: 1.0,
        },
        {
          name: "mute",
          defaultValue: 0,
          minValue: 0,
          maxValue: 1,
        }
      ]
    }
    
    process(inputList, outputList, parameters) {
        const volume = parameters.volume[0]
        const mute = parameters.mute[0]

        let input = inputList[0]
        let output = outputList[0]

        if (input[0] == undefined) return

        for (let i = 0; i < output[0].length; i++) {
            output[0][i] = input[0][i] * volume * !mute
        }

        return true;
    }
}
  
registerProcessor("output", OutputProcessor);