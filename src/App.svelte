<script>
    import { compute_slots } from 'svelte/internal';
import Modal from './Modal.svelte';
import VLogSlider from "./VLogSlider.svelte";

const SAT_LUM = "60% 30%"

const SPACING = 50
const KEYS = [
  { "id": 0, "text" : "A" }, 
  { "id": 1, "text" : "A#" }, 
  { "id": 2, "text" : "H" }, 
  { "id": 3, "text" : "C" }, 
  { "id": 4, "text" : "C#" }, 
  { "id": 5, "text" : "D" }, 
  { "id": 6, "text" : "D#" }, 
  { "id": 7, "text" : "E" }, 
  { "id": 8, "text" : "F" }, 
  { "id": 9, "text" : "F#" }, 
  { "id": 10, "text" : "G" }, 
  { "id": 11, "text" : "G#" }
]

const SCALES = [
  { "id": 0, "text": "Chromatic"},
  { "id": 1, "text": "Major"},
  { "id": 2, "text": "Minor"},
  { "id": 3, "text": "Octave"},
  { "id": 4, "text": "Fifths"},
  { "id": 5, "text": "Dim"},
  { "id": 6, "text": "Major Full"},
  { "id": 7, "text": "Minor Full"},
  { "id": 8, "text": "Pentatone"}
]

let overtones = [
  {"number": "G", "value": 0.9},
  {"number": "1", "value": 0.1},
  {"number": "2", "value": 0.8},
  {"number": "3", "value": 0.2},
  {"number": "4", "value": 0.7},
  {"number": "5", "value": 0.3},
  {"number": "6", "value": 0.6},
  {"number": "7", "value": 0.4},
  {"number": "8", "value": 0.5}
]

let showModal = true
let audioContext = null

// synth node params
let nodeparam_tempo_frequency
let nodeparam_tempo_duty_cycle
let nodeparam_vibrato_frequency
let nodeparam_vibrato_depth
let nodeparam_envelope_a
let nodeparam_envelope_d
let nodeparam_envelope_s
let nodeparam_envelope_r
let nodeparam_envelope_bypass
let nodeparam_random_osc_fmin
let nodeparam_random_osc_fmax
let nodeparam_random_osc_portamento
let nodeparam_random_osc_scale
let nodeparam_random_osc_key
let nodeparam_random_osc_poly
let nodeparam_random_osc_zero
let nodeparam_random_osc_chromatic
let nodeparam_overtones_1
let nodeparam_overtones_2
let nodeparam_overtones_3
let nodeparam_overtones_4
let nodeparam_overtones_5
let nodeparam_overtones_6
let nodeparam_overtones_7
let nodeparam_overtones_8
let nodeparam_overtones_9
let nodeparam_overtones_bypass

//output node params
let nodeparam_output_volume
let nodeparam_output_mute

let uiParams = {
  tempo_frequency: 0.0,
  tempo_duty_cycle: 0.0,
  vibrato_frequency: 0.0,
  vibrato_depth: 0.0,
  envelope_a: 0.0,
  envelope_d: 0.0,
  envelope_s: 0.0,
  envelope_r: 0.0,
  envelope_bypass: false,
  random_osc_fmin: 0.0,
  random_osc_fmax: 0.0,
  random_osc_portamento: 0.0,
  random_osc_scale: 0,
  random_osc_key: 0,
  random_osc_poly: 0,
  random_osc_zero: false,
  random_osc_chromatic: true,
  overtones_1: 0.0,
  overtones_2: 0.0,
  overtones_3: 0.0,
  overtones_4: 0.0,
  overtones_5: 0.0,
  overtones_6: 0.0,
  overtones_7: 0.0,
  overtones_8: 0.0,
  overtones_9: 0.0,
  overtones_bypass: false,
  //output_volume: 0.0,
  //output_mute: false
}

let uiParams_output_volume = 0.1
let uiParams_output_mute = false

const presets = [
  {"tempo_frequency":7,"tempo_duty_cycle":0.5,"vibrato_frequency":6,"vibrato_depth":0.01,"envelope_a":0.004,"envelope_d":0.05,"envelope_s":0.01,"envelope_r":0.001,"envelope_bypass":false,"random_osc_fmin":60,"random_osc_fmax":1523.8883984234885,"random_osc_portamento":0.003,"random_osc_scale":2,"random_osc_key":3,"random_osc_poly":4,"random_osc_zero":false,"random_osc_chromatic":true,"overtones_1":0.9,"overtones_2":0.1,"overtones_3":0.8,"overtones_4":0.2,"overtones_5":0.7,"overtones_6":0.3,"overtones_7":0.6,"overtones_8":0.4,"overtones_9":0.5,"overtones_bypass":false},
  {"tempo_frequency":6.066015868690048,"tempo_duty_cycle":1,"vibrato_frequency":234.2942735137835,"vibrato_depth":0.08809969781629272,"envelope_a":0.00010000000000000009,"envelope_d":0.016050974015544277,"envelope_s":0.0010000000000000002,"envelope_r":0.00010000000000000009,"envelope_bypass":false,"random_osc_fmin":80.899114314635,"random_osc_fmax":418.74206054179535,"random_osc_portamento":0.00010000000000000009,"random_osc_scale":8,"random_osc_key":1,"random_osc_poly":4,"random_osc_zero":false,"random_osc_chromatic":true,"overtones_1":0.42,"overtones_2":0.79,"overtones_3":0.35,"overtones_4":0.2,"overtones_5":0.46,"overtones_6":0.3,"overtones_7":0.28,"overtones_8":0.4,"overtones_9":0.17,"overtones_bypass":false},
  {"tempo_frequency":11.200292959425822,"tempo_duty_cycle":1,"vibrato_frequency":6,"vibrato_depth":0.01,"envelope_a":0.0039419544463087436,"envelope_d":0.00010000000000000009,"envelope_s":0.0010000000000000002,"envelope_r":0.00010000000000000009,"envelope_bypass":false,"random_osc_fmin":2157.1117387886597,"random_osc_fmax":5867.007734809797,"random_osc_portamento":0.15310972146914592,"random_osc_scale":2,"random_osc_key":1,"random_osc_poly":1,"random_osc_zero":false,"random_osc_chromatic":false,"overtones_1":0.9,"overtones_2":0.02,"overtones_3":0,"overtones_4":0,"overtones_5":0,"overtones_6":0.02,"overtones_7":0,"overtones_8":0,"overtones_9":0.03,"overtones_bypass":false},
  {"tempo_frequency":7,"tempo_duty_cycle":1,"vibrato_frequency":6,"vibrato_depth":0.01,"envelope_a":0.017827611104184734,"envelope_d":0.00010000000000000009,"envelope_s":0.0010000000000000002,"envelope_r":0.00010000000000000009,"envelope_bypass":true,"random_osc_fmin":60,"random_osc_fmax":291.5980430929545,"random_osc_portamento":10.000099999999994,"random_osc_scale":2,"random_osc_key":1,"random_osc_poly":4,"random_osc_zero":false,"random_osc_chromatic":false,"overtones_1":0.9,"overtones_2":0.1,"overtones_3":0.29,"overtones_4":0.2,"overtones_5":0.39,"overtones_6":0.3,"overtones_7":0.4,"overtones_8":0.4,"overtones_9":0.5,"overtones_bypass":false},
  {"tempo_frequency":6.066015868690048,"tempo_duty_cycle":1,"vibrato_frequency":6.718791778914033,"vibrato_depth":0.00010000000000000009,"envelope_a":0.004,"envelope_d":0.05,"envelope_s":0.0030408850256762807,"envelope_r":0.00017352287721457947,"envelope_bypass":true,"random_osc_fmin":70.48494856676132,"random_osc_fmax":361.79183785410027,"random_osc_portamento":0.02570408172044449,"random_osc_scale":2,"random_osc_key":3,"random_osc_poly":1,"random_osc_zero":false,"random_osc_chromatic":true,"overtones_1":1,"overtones_2":0,"overtones_3":0.07,"overtones_4":0,"overtones_5":0.04,"overtones_6":0.01,"overtones_7":0,"overtones_8":0,"overtones_9":0.02,"overtones_bypass":false},
  {"tempo_frequency":4.464168944609748,"tempo_duty_cycle":0.49,"vibrato_frequency":6.718791778914033,"vibrato_depth":0.00010000000000000009,"envelope_a":0.00010000000000000009,"envelope_d":0.018788366866064703,"envelope_s":0.0030408850256762807,"envelope_r":0.00010000000000000009,"envelope_bypass":false,"random_osc_fmin":93.40996444322866,"random_osc_fmax":852.2231819014457,"random_osc_portamento":0.00010000000000000009,"random_osc_scale":6,"random_osc_key":3,"random_osc_poly":2,"random_osc_zero":false,"random_osc_chromatic":true,"overtones_1":1,"overtones_2":0.35,"overtones_3":0.22,"overtones_4":0.47,"overtones_5":0.68,"overtones_6":0.2,"overtones_7":0.49,"overtones_8":0,"overtones_9":0,"overtones_bypass":false},
  {"tempo_frequency":13.624033175743822,"tempo_duty_cycle":1,"vibrato_frequency":6.718791778914033,"vibrato_depth":0.00010000000000000009,"envelope_a":0.00010000000000000009,"envelope_d":0.030133664724886298,"envelope_s":0.0010000000000000002,"envelope_r":0.00010000000000000009,"envelope_bypass":false,"random_osc_fmin":24.999999999999996,"random_osc_fmax":190.56289667328002,"random_osc_portamento":0.00010000000000000009,"random_osc_scale":2,"random_osc_key":3,"random_osc_poly":8,"random_osc_zero":false,"random_osc_chromatic":true,"overtones_1":1,"overtones_2":0.14,"overtones_3":0.78,"overtones_4":0.18,"overtones_5":0.71,"overtones_6":0.2,"overtones_7":0.28,"overtones_8":0,"overtones_9":0,"overtones_bypass":false},
  {"tempo_frequency":6.718791778914033,"tempo_duty_cycle":1,"vibrato_frequency":51.008909988536075,"vibrato_depth":0.038902499197007,"envelope_a":0.00010000000000000009,"envelope_d":0.021992604881920494,"envelope_s":0.0010000000000000002,"envelope_r":0.00010000000000000009,"envelope_bypass":false,"random_osc_fmin":24.999999999999996,"random_osc_fmax":190.56289667328002,"random_osc_portamento":0.00010000000000000009,"random_osc_scale":4,"random_osc_key":5,"random_osc_poly":1,"random_osc_zero":true,"random_osc_chromatic":true,"overtones_1":1,"overtones_2":0,"overtones_3":0,"overtones_4":0.18,"overtones_5":0.32,"overtones_6":0.2,"overtones_7":0.17,"overtones_8":0,"overtones_9":0,"overtones_bypass":false},
  {"tempo_frequency":1.2025391972106445,"tempo_duty_cycle":1,"vibrato_frequency":13.624033175743822,"vibrato_depth":0.00010000000000000009,"envelope_a":0.06535686050074126,"envelope_d":0.04075006088748382,"envelope_s":0.0010000000000000002,"envelope_r":0.00010000000000000009,"envelope_bypass":false,"random_osc_fmin":93.40996444322866,"random_osc_fmax":1220.8911427279636,"random_osc_portamento":0.00010000000000000009,"random_osc_scale":1,"random_osc_key":5,"random_osc_poly":3,"random_osc_zero":false,"random_osc_chromatic":true,"overtones_1":1,"overtones_2":0,"overtones_3":0,"overtones_4":0.18,"overtones_5":0.05,"overtones_6":0.2,"overtones_7":0.17,"overtones_8":0,"overtones_9":0.57,"overtones_bypass":false},
  {"tempo_frequency":18.51265094691578,"tempo_duty_cycle":1,"vibrato_frequency":13.624033175743822,"vibrato_depth":0.00010000000000000009,"envelope_a":0.00010000000000000009,"envelope_d":0.14362478196578665,"envelope_s":0.0010000000000000002,"envelope_r":0.00010000000000000009,"envelope_bypass":true,"random_osc_fmin":36.90403964136442,"random_osc_fmax":100.37323617885392,"random_osc_portamento":0.00010000000000000009,"random_osc_scale":1,"random_osc_key":9,"random_osc_poly":6,"random_osc_zero":false,"random_osc_chromatic":true,"overtones_1":1,"overtones_2":0,"overtones_3":0,"overtones_4":0.18,"overtones_5":0.05,"overtones_6":0.2,"overtones_7":0.17,"overtones_8":0,"overtones_9":0.15,"overtones_bypass":false}
]

let old_synthFMin
let old_synthFMax

//color for clipping LED indicator
let clippingColor = "#000000"

$: calcOvertonesParams(overtones)
$: limitF(uiParams)

//$: console.log("\n" + JSON.stringify(uiParams))

// synth processor
$: try { nodeparam_tempo_frequency.setValueAtTime(uiParams.tempo_frequency, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_tempo_duty_cycle.setValueAtTime(uiParams.tempo_duty_cycle, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_vibrato_frequency.setValueAtTime(uiParams.vibrato_frequency, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_vibrato_depth.setValueAtTime(uiParams.vibrato_depth, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_envelope_a.setValueAtTime(uiParams.envelope_a, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_envelope_d.setValueAtTime(uiParams.envelope_d, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_envelope_s.setValueAtTime(uiParams.envelope_s, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_envelope_r.setValueAtTime(uiParams.envelope_r, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_envelope_bypass.setValueAtTime(uiParams.envelope_bypass, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_random_osc_fmin.setValueAtTime(uiParams.random_osc_fmin, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_random_osc_fmax.setValueAtTime(uiParams.random_osc_fmax, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_random_osc_portamento.setValueAtTime(uiParams.random_osc_portamento, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_random_osc_scale.setValueAtTime(uiParams.random_osc_scale, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_random_osc_key.setValueAtTime(uiParams.random_osc_key, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_random_osc_poly.setValueAtTime(uiParams.random_osc_poly, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_random_osc_zero.setValueAtTime(uiParams.random_osc_zero, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_random_osc_chromatic.setValueAtTime(uiParams.random_osc_chromatic, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_overtones_1.setValueAtTime(uiParams.overtones_1, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_overtones_2.setValueAtTime(uiParams.overtones_2, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_overtones_3.setValueAtTime(uiParams.overtones_3, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_overtones_4.setValueAtTime(uiParams.overtones_4, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_overtones_5.setValueAtTime(uiParams.overtones_5, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_overtones_6.setValueAtTime(uiParams.overtones_6, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_overtones_7.setValueAtTime(uiParams.overtones_7, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_overtones_8.setValueAtTime(uiParams.overtones_8, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_overtones_9.setValueAtTime(uiParams.overtones_9, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_overtones_bypass.setValueAtTime(uiParams.overtones_bypass, audioContext.currentTime) } catch(e) {}

// output processor
$: try { nodeparam_output_volume.setValueAtTime(uiParams_output_volume, audioContext.currentTime) } catch(e) {}
$: try { nodeparam_output_mute.setValueAtTime(uiParams_output_mute, audioContext.currentTime) } catch(e) {}

function getRandomSynthParameters(processorNode) {
  nodeparam_tempo_frequency = processorNode.parameters.get("tempo_frequency")
  nodeparam_tempo_duty_cycle = processorNode.parameters.get("tempo_duty_cycle")
  nodeparam_vibrato_frequency = processorNode.parameters.get("vibrato_frequency")
  nodeparam_vibrato_depth = processorNode.parameters.get("vibrato_depth")
  nodeparam_envelope_a = processorNode.parameters.get("envelope_a")
  nodeparam_envelope_d = processorNode.parameters.get("envelope_d")
  nodeparam_envelope_s = processorNode.parameters.get("envelope_s")
  nodeparam_envelope_r = processorNode.parameters.get("envelope_r")
  nodeparam_envelope_bypass = processorNode.parameters.get("envelope_bypass")
  nodeparam_random_osc_fmin = processorNode.parameters.get("random_osc_fmin")
  nodeparam_random_osc_fmax = processorNode.parameters.get("random_osc_fmax")
  nodeparam_random_osc_portamento = processorNode.parameters.get("random_osc_portamento")
  nodeparam_random_osc_scale = processorNode.parameters.get("random_osc_scale")
  nodeparam_random_osc_key = processorNode.parameters.get("random_osc_key")
  nodeparam_random_osc_poly = processorNode.parameters.get("random_osc_poly")
  nodeparam_random_osc_zero = processorNode.parameters.get("random_osc_zero")
  nodeparam_random_osc_chromatic = processorNode.parameters.get("random_osc_chromatic")
  nodeparam_overtones_1 = processorNode.parameters.get("overtones_1")
  nodeparam_overtones_2 = processorNode.parameters.get("overtones_2")
  nodeparam_overtones_3 = processorNode.parameters.get("overtones_3")
  nodeparam_overtones_4 = processorNode.parameters.get("overtones_4")
  nodeparam_overtones_5 = processorNode.parameters.get("overtones_5")
  nodeparam_overtones_6 = processorNode.parameters.get("overtones_6")
  nodeparam_overtones_7 = processorNode.parameters.get("overtones_7")
  nodeparam_overtones_8 = processorNode.parameters.get("overtones_8")
  nodeparam_overtones_9 = processorNode.parameters.get("overtones_9")
  nodeparam_overtones_bypass = processorNode.parameters.get("overtones_bypass")
}

function getOutputParameters(processorNode) {
  nodeparam_output_volume = processorNode.parameters.get("volume")
  nodeparam_output_mute = processorNode.parameters.get("mute")
}

function selectPreset(e) {
  let index = e.target.value

  //avoid linking by doing JSON stringify and parse
  uiParams = JSON.parse(JSON.stringify(presets[index]))
  calcOvertonesArray(uiParams) 
}

async function createOutputNode() {
  let processorNode
  try {
    await audioContext.audioWorklet.addModule("output.js")
    processorNode = new AudioWorkletNode(audioContext, "output")
  } catch (e) {
    console.log(`** Error: Unable to create worklet node: ${e}`)
    return null;
  }

  await audioContext.resume()
  return processorNode
}

async function createRandomSynthNode() {
  let processorNode
  try {
    await audioContext.audioWorklet.addModule("random-synth.js")
    processorNode = new AudioWorkletNode(audioContext, "random-synth")
  } catch (e) {
    console.log(`** Error: Unable to create worklet node: ${e}`)
    return null;
  }
  await audioContext.resume()
  return processorNode
}

async function audioStart() {
  uiParams = presets[0]
  old_synthFMin = uiParams.random_osc_fmin
  old_synthFMax = uiParams.random_osc_fmax

  createAudioContext()

  //synth
  let randomSynthNode = await createRandomSynthNode()
  if (!randomSynthNode) {
    console.log("** Error: unable to create randmom synth")
    return
  }

  //output
  let outputNode = await createOutputNode()
  if (!outputNode) {
    console.log("** Error: unable to create output")
    return
  }

  getRandomSynthParameters(randomSynthNode)
  getOutputParameters(outputNode)

  //the two following statements seems to do the same thing:
  //const soundSource = new OscillatorNode(audioContext)
  const soundSource = audioContext.createOscillator()

  //analyzer
  const analyserNode = audioContext.createAnalyser()
  const pcmData = new Float32Array(analyserNode.fftSize)

  const onFrame = () => {
    analyserNode.getFloatTimeDomainData(pcmData)
    let maxVal = 0
    maxVal = pcmData.reduce((a, b) => Math.max(a, b), -Infinity)
    clippingColor = (maxVal * uiParams_output_volume > 1) ? "#FF0000" : "#000000"
    window.requestAnimationFrame(onFrame)
  }
  window.requestAnimationFrame(onFrame)

  soundSource
    .connect(randomSynthNode)
    .connect(analyserNode)
    .connect(outputNode)
    .connect(audioContext.destination)
  soundSource.start()
}

function createAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new AudioContext({"sampleRate": 41100})
    } catch (e) {
      console.log("** Error: Unable to create audio context")
      return null
    }
  }
}

async function closeAudioContext() {
  await audioContext.close()
    audioContext = null
}

function startSound() {
  showModal = false
  if (!audioContext) {
    audioStart()
  }
}

function toDb(val) {
  return 20 * Math.log10(val)
}

function formatNumDb(val) {
  val = toDb(val)
  if (val < 1000) {
    return (val < 10) ? val.toFixed(2) : val.toFixed(1)
  } else if (val < 0.001) {
    return ("0")
  } else if (val < 10000) {
    return (val / 1000).toFixed(2) + "k"
  } else {
    return (val / 1000).toFixed(1) + "k"
  }
}

function formatNum(val) {
  //console.log(val)
  if (val < 1000) {
    return (val < 10) ? val.toFixed(3) : val.toFixed(1)
  } else if (val < 0.001) {
    return ("0")
  } else if (val < 10000) {
    return (val / 1000).toFixed(2) + "k"
  } else {
    return (val / 1000).toFixed(1) + "k"
  }
}

function calcOvertonesArray(uiParams) {
  overtones[0].value = uiParams.overtones_1
  overtones[1].value = uiParams.overtones_2
  overtones[2].value = uiParams.overtones_3
  overtones[3].value = uiParams.overtones_4
  overtones[4].value = uiParams.overtones_5
  overtones[5].value = uiParams.overtones_6
  overtones[6].value = uiParams.overtones_7
  overtones[7].value = uiParams.overtones_8
  overtones[8].value = uiParams.overtones_9
}

function calcOvertonesParams(overtones) {
  uiParams.overtones_1 = overtones[0].value
  uiParams.overtones_2 = overtones[1].value
  uiParams.overtones_3 = overtones[2].value
  uiParams.overtones_4 = overtones[3].value
  uiParams.overtones_5 = overtones[4].value
  uiParams.overtones_6 = overtones[5].value
  uiParams.overtones_7 = overtones[6].value
  uiParams.overtones_8 = overtones[7].value
  uiParams.overtones_9 = overtones[8].value
}

function limitF(p) {
  if (uiParams.random_osc_fmax != old_synthFMax) {
    old_synthFMax = uiParams.random_osc_fmax
    uiParams.random_osc_fmin = (uiParams.random_osc_fmin > uiParams.random_osc_fmax) ? uiParams.random_osc_fmax : uiParams.random_osc_fmin  
  }

  if (uiParams.random_osc_fmin != old_synthFMin) {
    old_synthFMin = uiParams.random_osc_fmin
    uiParams.random_osc_fmax = (uiParams.random_osc_fmin > uiParams.random_osc_fmax) ? uiParams.random_osc_fmin : uiParams.random_osc_fmax
  }
}

</script>

{#if showModal}
  <Modal on:close={startSound} />
{:else}
  <div class="synth">

    <!------------------------- Random Oscillators Panel --------------------------->
    <div class="module" style="top: 3px; left: 3px; width: 310px; height: 170px;">

      <!-- Panel title -->
      <div class="abs module-title" style="top: 0px; left: 0px; background: hsl(0 {SAT_LUM});">
        <div class="module-title-text">RANDOM OSCILLATORS</div>
      </div>

      <!------------- F min ------------>
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:7px">
        <div class="display-text">{formatNum(uiParams.random_osc_fmin)}</div>
      </div>

      <!-- Slider -->
      <div class="abs" style="top: 43px; left:16px">
          <VLogSlider min={25} max={10000} bind:value={uiParams.random_osc_fmin} />
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3}px" >
        <div class="label-text">F min</div>
      </div>

      <!------------- F max ------------>
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:{7+SPACING}px">
        <div class="display-text">{formatNum(uiParams.random_osc_fmax)}</div>
      </div>

      <!-- Slider -->
      <div class="abs" style="top: 43px; left:{16+SPACING}px">
          <VLogSlider min={25} max={10000} bind:value={uiParams.random_osc_fmax} />
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3+SPACING}px" >
        <div class="label-text">F max</div>
      </div>

      <!------------- Portamento ------------>
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:{7+2*SPACING}px">
        <div class="display-text">{formatNum(uiParams.random_osc_portamento)}</div>
      </div>

      <!-- Slider -->
      <div class="abs" style="top: 43px; left:{16+2*SPACING}px">
          <VLogSlider min={0.0001} max={10.0001} bind:value={uiParams.random_osc_portamento} />
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3+2*SPACING}px" >
        <div class="label-text">Portamento</div>
      </div>

      <!-- Oscillators: rækkefølge fra top: poly, tones, key, scale, zero -->

      <!--------------- poly -------------->
      <!-- numeric stepper -->
      <div class="abs" style="top: 88px; left: 166px" >
        <input type="number" style="width: 34px;" step="1" min="1" max="10" bind:value={uiParams.random_osc_poly}>
      </div>

      <!-- Label -->
      <div class="label-div abs" style="top: 91px; left: 212px" >
        <div class="label-text-left">Poly</div>
      </div>      
      
      <!------------ Tones ------------->
      <!-- Checkbox -->
      <div class="abs" style="top: 145px; left: 190px" >
        <input type="checkbox" bind:checked={uiParams.random_osc_chromatic} >
      </div>

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: 212px" >
        <div class="label-text-left">Tones</div>
      </div>      

      <!--------------- Key ---------------->
      <!--- select -->
      <div class="abs" style="top: 54px; left: 166px" >
        <select disabled={!uiParams.random_osc_chromatic} bind:value={uiParams.random_osc_key}>
          {#each KEYS as key }
            <option value={key.id}>
              {key.text}
            </option>
          {/each}
        </select>
      </div>

      <!-- Label -->
      <div class="label-div abs" style="top: 57px; left: 212px" >
        <div class="label-text-left">Key</div>
      </div>      

      <!--------------- Scale ---------------->
      <!--- select -->
      <div class="abs" style="top: 20px; left: 166px;" >
        <select disabled={!uiParams.random_osc_chromatic} bind:value={uiParams.random_osc_scale} style="width: 90px">
          {#each SCALES as scale }
            <option value={scale.id}>
              {scale.text}
            </option>
          {/each}
        </select>
      </div>

      <!-- Label -->
      <div class="label-div abs" style="top: 23px; left: 260px;" >
        <div class="label-text-left">Scale</div>
      </div>      
      
      <!------------ Zero ------------->
      <!-- Checkbox -->
      <div class="abs" style="top: 120px; left: 190px" >
        <input type="checkbox" bind:checked={uiParams.random_osc_zero} >
      </div>

      <!-- Label -->
      <div class="label-div abs" style="top: 123px; left: 212px" >
        <div class="label-text-left">Zero</div>
      </div>      


    </div>

    <!------------------------- Harmonic Overtones Panel --------------------------->
    <div class="module" style="top: 3px; left: 317px; width: 458px; height: 170px;">

      <!-- Panel title -->
      <div class="abs module-title" style="top: 0px; left: 0px; background: hsl(45deg {SAT_LUM});">
        <div class="module-title-text">HARMONIC OVERTONES</div>
      </div>

      <!-- 7 sections -->
      {#each overtones as overtone, i }
        <div class="abs" style="left:{i*SPACING}px">

          <!-- Display -->
          <div class="display-div abs" style="top: 22px; left:{7}px">
            <div class="display-text">{formatNum(overtone.value)}</div>
          </div>
          
          <!-- Slider -->
          <div class="abs" style="top: 43px; left:{16}px">
            <input type="range" style="height: 100px;" orient="vertical" min="0" max="1" step="0.01" bind:value={overtone.value} />        
          </div>  

          <!-- Label -->
          <div class="label-div abs" style="top: 147px; left: {3}px" >
            <div class="label-text">{overtone.number}</div>
          </div>
        </div>        
      {/each}    
    </div>
    
    <!------------------------- Tempo Panel --------------------------->
    <div class="module" style="top: 177px; left: 3px; width: 103px; height: 170px;">

      <!-- Panel title -->
      <div class="abs module-title" style="top: 0px; left: 0px; background: hsl(80deg {SAT_LUM});">
        <div class="module-title-text">TEMPO</div>
      </div>

      <!------------ Frequency ------------>
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:{7}px">
        <div class="display-text">{formatNum(uiParams.tempo_frequency)}</div>
      </div>

      <!-- Slider -->
      <div class="abs" style="top: 43px; left:{16}px">
          <VLogSlider min={0.1} max={500} bind:value={uiParams.tempo_frequency} />
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3}px" >
        <div class="abs label-text">Freq</div>
      </div>

      <!------------ Duty Cycle ------------>
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:{7+SPACING}px">
        <div class="display-text">{formatNum(uiParams.tempo_duty_cycle)}</div>
      </div>

      <!-- Slider -->
      <div class="abs" style="top: 43px; left:{16+SPACING}px">
        <input type="range" style="height: 100px;" orient="vertical" min="0" max="1" step="0.01" bind:value={uiParams.tempo_duty_cycle} />        
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3+SPACING}px" >
        <div class="abs label-text">Duty C.</div>
      </div>
    </div>

    <!------------------------- Vibrato Panel --------------------------->
    <div class="module" style="top: 177px; left: 110px; width: 103px; height: 170px;">

      <!-- Panel title -->
      <div class="abs module-title" style="top: 0px; left: 0px; background: hsl(135deg {SAT_LUM});">
        <div class="module-title-text">VIBRATO</div>
      </div>

      <!------------- Frequency ------------>
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:7px">
        <div class="display-text">{formatNum(uiParams.vibrato_frequency)}</div>
      </div>

      <!-- Slider -->
      <div class="abs" style="top: 43px; left:16px">
          <VLogSlider min={0.1} max={500} bind:value={uiParams.vibrato_frequency} />
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3}px" >
        <div class="label-text">Freq</div>
      </div>

      <!------------- Depth -------------->
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:{7+SPACING}px">
        <div class="display-text">{formatNum(uiParams.vibrato_depth)}</div>
      </div>    

      <!-- Slider -->
      <div class="abs" style="top: 43px; left:{16+SPACING}px">
        <VLogSlider min={0.0001} max={9.999} bind:value={uiParams.vibrato_depth} />
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3+SPACING}px" >
        <div class="label-text">Depth</div>
      </div>      
    </div>

    <!------------------------- Envelope Panel --------------------------->
    <div class="module" style="top: 177px; left: 217px; width: 263px; height: 170px;">

      <!-- Panel title -->
      <div class="abs module-title" style="top: 0px; left: 0px; background: hsl(180deg {SAT_LUM});">
        <div class="module-title-text">ENVELOPE</div>
      </div>

      <!------------- A ------------>
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:7px">
        <div class="display-text">{formatNum(uiParams.envelope_a)}</div>
      </div>

      <!-- Slider -->
      <div class="abs" style="top: 43px; left:16px">
          <VLogSlider min={0.0001} max={50} bind:value={uiParams.envelope_a} />
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3}px" >
        <div class="label-text">A</div>
      </div>

      <!------------- D ------------>
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:{7+SPACING}px">
        <div class="display-text">{formatNum(uiParams.envelope_d)}</div>
      </div>

      <!-- Slider -->
      <div class="abs" style="top: 43px; left:{16+SPACING}px">
          <VLogSlider min={0.0001} max={50} bind:value={uiParams.envelope_d} />
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3+SPACING}px" >
        <div class="label-text">D</div>
      </div>

      <!------------- S ------------>
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:{7+2*SPACING}px">
        <div class="display-text">{formatNum(uiParams.envelope_s)}</div>
      </div>

      <!-- Slider -->
      <div class="abs" style="top: 43px; left:{16+2*SPACING}px">
          <VLogSlider min={0.001} max={1} bind:value={uiParams.envelope_s} />
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3+2*SPACING}px" >
        <div class="label-text">S</div>
      </div>

      <!------------- R ------------>
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:{7+3*SPACING}px">
        <div class="display-text">{formatNum(uiParams.envelope_r)}</div>
      </div>

      <!-- Slider -->
      <div class="abs" style="top: 43px; left:{16+3*SPACING}px">
          <VLogSlider min={0.0001} max={50} bind:value={uiParams.envelope_r} />
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3+3*SPACING}px" >
        <div class="label-text">R</div>
      </div>

      <!---------- bypass ---------->
      <!-- Checkbox -->
      <div class="abs" style="top: 142px; left: 189px" >
        <input type="checkbox" bind:checked={uiParams.envelope_bypass} >
      </div>

      <!-- Label -->
      <div class="label-div abs" style="top: 144px; left: 209px" >
        <div class="label-text-left">Bypass</div>
      </div>
    </div>

    <!------------------------- Presets Panel --------------------------->
    <div class="module" style="top: 177px; left: 484px; width: 176px; height: 78px;">

      <!-- Panel title -->
      <div class="abs module-title" style="background: hsl(245deg {SAT_LUM});">
        <div class="module-title-text">PRESETS</div>
      </div>

      <div style="margin-top: 24px;">
        <!-- 10 preset buttons-->
        {#each Array(10) as _, index (index)}
          <button on:click={selectPreset} value="{index}" style="font-weight: bold; cursor: pointer; margin-left: 4px; margin-bottom: 6px; width: 30px; height: 20px;">{index+1}</button>
        {/each}
      </div>
    </div>

    <!------------------------- Output Panel --------------------------->
    <div class="module" style="top: 177px; left: 664px; width: 110px; height: 170px;">

      <!-- Panel title -->
      <div class="abs module-title" style="top: 0px; left: 0px; background: hsl(270deg {SAT_LUM});">
        <div class="module-title-text">OUTPUT</div>
      </div>
      
      <!------------- Volume ------------>
      <!-- Display -->
      <div class="display-div abs" style="top: 22px; left:7px">
        <div class="display-text">{formatNumDb(uiParams_output_volume)}</div>
      </div>

      <!-- Label -->
      <div class="label-div abs" style="top: 25px; left: 34px" >
        <div class="label-text">dB</div>
      </div>
      
      <!-- Slider -->
      <div class="abs" style="top: 43px; left:16px">
        <VLogSlider min={0.000015258} max={1} bind:value={uiParams_output_volume} />
      </div>  

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: {3}px" >
        <div class="label-text">Vol</div>
      </div>

      <!------ Clipping indicator ----->
      <!-- indicator div -->
      <div class="label-div abs" style="top: 125px; left: 54px" >
        <div class="clip" style="background-color:{clippingColor}"> </div>
      </div>

      <!-- Label -->
      <div class="label-div abs" style="top: 125px; left: 69px" >
        <div class="label-text-left">Clip</div>
      </div>

      <!------------ Mute ------------->
      <!-- Checkbox -->
      <div class="abs" style="top: 145px; left: 50px" >
        <input type="checkbox" bind:checked={uiParams_output_mute} >
      </div>

      <!-- Label -->
      <div class="label-div abs" style="top: 147px; left: 69px" >
        <div class="label-text-left">Mute</div>
      </div>      


    </div>

    <!-------------------------- Title Panel ---------------------------->
    <div class="module" style="top: 259px; left: 484px; width: 176px; height: 88px;">

      <!-- Panel title -->
      <div class="abs module-title" style="background: hsl(315deg {SAT_LUM});">
        <div class="module-title-text">ABOUT</div>
      </div>

      <div class="text-center" style="margin:10px; margin-top:20px; font-size: 11px;">
        The Random Synthesizer<br>by Jesper Eklund<br>2023<br>
        <a href="./source.zip">download sourcecode</a>
      </div>

    </div>    
  </div>
{/if}

<style>
  .synth {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 779px;
    height: 351px;
		transform: translate(-50%,-50%);
    background-color: #1d1d1d;
    border: 3px solid;
    border-color:#afafaf;
    background-color: #000000;
	}

  .module {
    position: absolute;
    border-radius: 4px;
    __background-color: #C5C7C6;
    background-image: url('./brushed-alu.jpg');
    border: 1px solid;
    border-color: #dfdfdf #5e5e5e #464646 #b9b9b9 ;
  }

  .module-title {
    color: aliceblue;
    font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11px;
    width: 100%;
    height: 16px;
    text-align: left;
    padding-left: px;
    border-bottom: 1px solid;
    border-color: #333333;
  }

  .clip {
    width: 10px;
    height: 10px;
    border: 1px solid #000000;
  }

  .label-div {
    display: flex;
    width: 50px;
    height: 16px;
    margin: 0;
    padding: 0;
  }

  .label-text {
    color: rgb(0, 0, 0);
    font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 10px;
    width: 47px;
    text-align: center;
    font-weight: bold;
  }

  .label-text-left {
    color: rgb(0, 0, 0);
    font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 10px;
    width: 47px;
    text-align: left;
    font-weight: bold;
  }

  .text-center {
    color: rgb(0, 0, 0);
    font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
    text-align: center;
  }

  .module-title-text {
    margin-left: 3px;
  }

  .display-div {
    display: flex;
    width: 38px;
    height: 16px;
    margin: 0;
    padding: 0;
    background-color:#010101;
    border: 1px solid;
    border-color: #000000 #e2e2e2 #e9e9e9 #000000 ;
    border-radius: 3px;
  }

  .display-text {
    color: #F42A02;
    margin:0px;
    width: 35px;
    font-family: 'LCD', sans-serif;
    text-align: right;
    font-size: 14px;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */    
  }

  .abs {
    position: absolute;
  }

  input[type=number] {
        width: 30px;
  }
</style>