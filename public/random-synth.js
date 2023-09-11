
class Envelope {
  a             //float
  d             //float
  s             //float
  r             //float
  b             //bool
  state         //int
  volume        //float
  coeff         //float
  seekSustain   //float

  count = 0

  on(a, d, s, r, bypass) {
    //console.log("Envelope.on", a, d, s, r, bypass)
    this.setParams(a, d, s, r, bypass)
    this.volume = 0
    this.state = 1
    this.seekSustain = 1
    this.coeff = a * 100000
  }

  off(a, d, s, r, bypass) {
    //console.log("Envelope.off", a, d, s, r, bypass)
    this.setParams(a, d, s, r, bypass)
    this.state = 3
    this.seekSustain = 0
    this.coeff = r * 100000	
  }

  nextVolume() {
    if ( this.volume > 0.97 && this.state == 1 ) {
      this.state = 2
      this.coeff = this.d * 100000
      this.seekSustain = this.s
    }
    this.volume += ( this.seekSustain - this.volume ) / this.coeff;
    let ret = ( this.b == true ) ? ( this.state == 3 ) ? 0.0 : 1.0 : this.volume

    if (this.count % 10000 == 0) {
      //console.log("nextVolume", this.volume)
    }
    this.count++
    return ret
  }

  setParams(a, d, s, r, bypass) {
    //console.log("Envelope.setParams", a, d, s, r, bypass)
    this.a = a
    this.d = d
    this.s = s
    this.r = r
    this.b = bypass
  }
}

class RandomeSynthProcessor extends AudioWorkletProcessor {
  PI2 = Math.PI * 2;
  F_SAMPLE = 44100;
  PI2_DIV_F_SAMPLE = Math.PI * 2 / 44100;
  F_0 = 22.5;
  
  CHORDS = [
    [0,1,2,3,4,5,6,7,8,9,10,11]  //Chromatic
    ,[0,0,0,0,4,4,4,4,7,7,7,7]   //Major
    ,[0,0,0,0,3,3,3,3,7,7,7,7]   //Minor
    ,[0,0,0,0,0,0,0,0,0,0,0,0]   //Octave
    ,[0,0,0,0,0,0,7,7,7,7,7,7]   //Fifths
    ,[0,0,0,3,3,3,6,6,6,9,9,9]   //Dim
    ,[0,0,2,2,4,4,5,7,9,11,7,7]  //Major Full Scale
    ,[0,0,2,2,3,3,5,5,7,7,8,10]  //Minor Full Scale
    ,[0,0,0,3,3,5,5,5,7,7,10,10] //Pentaton
  ]

  envelope

  tempo_frequency
  tempo_duty_cycle
  vibrato_frequency
  vibrato_depth

  envelope_a
  envelope_d
  envelope_s
  envelope_r
  envelope_bypass

  random_osc_fmin
  random_osc_fmax
  random_osc_portamento
  random_osc_poly
  random_osc_scale
  random_osc_key
  random_osc_poly
  random_osc_zero
  random_osc_chromatic

  overtones_1
  overtones_2
  overtones_3
  overtones_4
  overtones_5
  overtones_6
  overtones_7
  overtones_8
  overtones_9
  overtones_bypass
  overtones  

  output_mute = false
  output_volume = 1

  samplePosition = 0
  interval = 1000
  length = 500
  vibrato_w = 0

  w = []
  wDelta = []
  wDeltaSeek = []
  frequency = []

  constructor() {
    super()
    this.envelope = new Envelope()
    this.envelope.on(this.envelope_a, this.envelope_d, this.envelope_s, this.envelope_r, this.envelope_bypass)
    this.resetArrays()
  }

  quantisizeToNearestNote(f) {
    const note_a = Math.pow(2,1/12)
    let n = Math.log(f / this.F_0 ) / Math.log(note_a)
    n -= this.random_osc_key
    n = this.CHORDS[this.random_osc_scale][Math.floor(this.random_osc_key + n) % 12] + n - ( n % 12 ) + this.random_osc_key
    return this.F_0 * Math.pow(note_a, n)
  }

  resetArrays() {
    this.wDelta = []
    this.w = []
    this.frequency = []
    this.wDeltaSeek = []

    for (let i = 0; i<this.random_osc_poly; i++ ) {
        this.wDelta.push(0)
        this.w.push(0)
        this.frequency.push(0)
        this.wDeltaSeek.push(0)
    }				
    //console.log("resetArray", this.wDelta, this.w, this.frequency ,this.wDeltaSeek)
  }

  getNextVal() {
    let doChange = false

    //Tempo trigger has occured
    if ( this.samplePosition % this.interval == 0 ) {
      //console.log("Tempo trigger")
      this.lengthPosition = 0
      this.envelope.on(this.envelope_a, this.envelope_d, this.envelope_s, this.envelope_r, this.envelope_bypass)
        doChange = true
    }

    //Tempo length has been reached  
    if ( this.lengthPosition == this.length ) {
      this.envelope.off(this.envelope_a, this.envelope_d, this.envelope_s, this.envelope_r, this.envelope_bypass)
    }

    //vibrato
    this.vibrato_w += this.vibrato_fdelta
    let vibrato_sin = this.vibrato_depth * Math.sin(this.vibrato_w)

    let sum = 0

    //summing poly
    for (let i=0; i<this.random_osc_poly; i++ ) {
        this.wDelta[i] += ( this.wDeltaSeek[i] - this.wDelta[i] ) / this.random_osc_portamento
        this.w[i] += this.wDelta[i] + vibrato_sin

        //new notes has been triggered 
        if ( doChange == true ) {
            this.frequency[i] = this.random_osc_fmin + ( Math.random() * ( this.random_osc_fmax - this.random_osc_fmin ) )
            this.frequency[i] = ( this.random_osc_chromatic ) ? this.quantisizeToNearestNote(this.frequency[i]) : this.frequency[i]
            this.wDeltaSeek[i] = this.frequency[i] * this.PI2_DIV_F_SAMPLE
            this.w[i] = (this.random_osc_zero) ? 0 : this.w[i]
        }

        for (var o=0; o<9; o++ ) {
            sum += Math.sin((o + 1) * this.w[i]) * this.overtones[o]
        }
    }
    let envVol = this.envelope.nextVolume()
    let val = !(this.output_mute) * envVol * this.output_volume * sum // / this.random_osc_poly
    this.samplePosition++
    this.lengthPosition++

    return val
  }
  
  static get parameterDescriptors() {
    return [
      {
        name: "tempo_frequency",
        defaultValue: 2.0,
        minValue: 0.1,
        maxValue: 500.0
      },
      {
        name: "tempo_duty_cycle",
        defaultValue: 0.5,
        minValue: 0.0,
        maxValue: 1.0
      },
      {
        name: "vibrato_frequency",
        defaultValue: 5.0,
        minValue: 0.1,
        maxValue: 500.0
      },
      {
        name: "vibrato_depth",
        defaultValue: 0.1,
        minValue: 0.0,
        maxValue: 10.0
      },
      {
        name: "envelope_a",
        defaultValue: 0.1,
        minValue: 0.0,
        maxValue: 50.0
      },
      {
        name: "envelope_d",
        defaultValue: 0.1,
        minValue: 0.0,
        maxValue: 50.0
      },
      {
        name: "envelope_s",
        defaultValue: 0.5,
        minValue: 0.0,
        maxValue: 1.0
      },
      {
        name: "envelope_r",
        defaultValue: 0.1,
        minValue: 0.0,
        maxValue: 50.0
      },
      {
        name: "envelope_bypass",
        defaultValue: 0,
        minValue: 0,
        maxValue: 1
      },
      {
        name: "random_osc_fmin",
        defaultValue: 200.0,
        minValue: 25.0,
        maxValue: 20000.0
      },
      {
        name: "random_osc_fmax",
        defaultValue: 3000.0,
        minValue: 25.0,
        maxValue: 20000.0
      },
      {
        name: "random_osc_portamento",
        defaultValue: 0.1,
        minValue: 0.0,
        maxValue: 10.0
      },
      {
        name: "random_osc_scale",
        defaultValue: 1,
        minValue: 0,
        maxValue: 8
      },
      {
        name: "random_osc_key",
        defaultValue: 1,
        minValue: 0,
        maxValue: 11
      },
      {
        name: "random_osc_poly",
        defaultValue: 4,
        minValue: 1,
        maxValue: 10
      },
      {
        name: "random_osc_zero",
        defaultValue: 1,
        minValue: 0,
        maxValue: 1
      },
      {
        name: "random_osc_chromatic",
        defaultValue: 1,
        minValue: 0,
        maxValue: 1
      },
      {
        name: "overtones_1",
        defaultValue: 0.1,
        minValue: 0.0,
        maxValue: 1.0
      },
      {
        name: "overtones_2",
        defaultValue: 0.2,
        minValue: 0.0,
        maxValue: 1.1
      },
      {
        name: "overtones_3",
        defaultValue: 0.3,
        minValue: 0.0,
        maxValue: 1.1
      },
      {
        name: "overtones_4",
        defaultValue: 0.4,
        minValue: 0.0,
        maxValue: 1.0
      },
      {
        name: "overtones_5",
        defaultValue: 0.5,
        minValue: 0.0,
        maxValue: 1.0
      },
      {
        name: "overtones_6",
        defaultValue: 0.6,
        minValue: 0.0,
        maxValue: 1.0
      },
      {
        name: "overtones_7",
        defaultValue: 0.7,
        minValue: 0.0,
        maxValue: 1.0
      },
      {
        name: "overtones_8",
        defaultValue: 0.8,
        minValue: 0.0,
        maxValue: 1.0
      },
      {
        name: "overtones_9",
        defaultValue: 0.9,
        minValue: 0.0,
        maxValue: 1.0
      },
      {
        name: "overtones_bypass",
        defaultValue: 0,
        minValue: 0.0,
        maxValue: 1.0
      }
    ]
  }
    
  process(inputList, outputList, parameters) {
    this.tempo_frequency          = parameters.tempo_frequency[0]
    this.tempo_duty_cycle         = parameters.tempo_duty_cycle[0]
    this.vibrato_frequency        = parameters.vibrato_frequency[0]
    this.vibrato_depth            = parameters.vibrato_depth[0] * 0.05 //look in old flex
    this.envelope_a               = parameters.envelope_a[0]
    this.envelope_d               = parameters.envelope_d[0]
    this.envelope_s               = parameters.envelope_s[0]
    this.envelope_r               = parameters.envelope_r[0]
    this.envelope_bypass          = parameters.envelope_bypass[0]
    this.random_osc_fmin          = parameters.random_osc_fmin[0]
    this.random_osc_fmax          = parameters.random_osc_fmax[0]
    this.random_osc_portamento    = 1 + parameters.random_osc_portamento[0] * 10000
    this.random_osc_scale         = parameters.random_osc_scale[0]
    this.random_osc_key           = parameters.random_osc_key[0]

    if (this.random_osc_poly != parameters.random_osc_poly[0]) {
      this.random_osc_poly = parameters.random_osc_poly[0]  
      this.resetArrays()
    }

    this.random_osc_poly           = parameters.random_osc_poly[0]
    this.random_osc_zero           = parameters.random_osc_zero[0]
    this.random_osc_chromatic      = parameters.random_osc_chromatic[0]
    this.overtones_1               = parameters.overtones_1[0]
    this.overtones_2               = parameters.overtones_2[0]
    this.overtones_3               = parameters.overtones_3[0]
    this.overtones_4               = parameters.overtones_4[0]
    this.overtones_5               = parameters.overtones_5[0]
    this.overtones_6               = parameters.overtones_6[0]
    this.overtones_7               = parameters.overtones_7[0]
    this.overtones_8               = parameters.overtones_8[0]
    this.overtones_9               = parameters.overtones_9[0]
    this.overtones_bypass          = parameters.overtones_bypass[0]  
    this.overtones = [
      this.overtones_1, 
      this.overtones_2, 
      this.overtones_3, 
      this.overtones_4, 
      this.overtones_5, 
      this.overtones_6, 
      this.overtones_7, 
      this.overtones_8, 
      this.overtones_9
    ]

    this.interval = Math.floor(this.F_SAMPLE / this.tempo_frequency)    
    this.length = Math.floor(this.interval * this.tempo_duty_cycle)
    this.vibrato_fdelta = this.vibrato_frequency * this.PI2_DIV_F_SAMPLE;

    let output = outputList[0];
    let sampleCount = output[0].length;

    for (let i=0; i<sampleCount; i++) {
      let val = this.getNextVal()
      output[0][i] = val
    }
    return true
  }
}
  
registerProcessor("random-synth", RandomeSynthProcessor);