<script>
    export let min
    export let max
    export let value

    const minLocal = 0
    const maxLocal = 1000
    let valueLocal
    
    let factor
    let minv
    let maxv

    $: calcFactor(min, max)    
    $: log2lin(value)

    function calcFactor(min, max) {
        minv = Math.log(min);
		maxv = Math.log(max);
        factor = (maxv-minv) / (maxLocal-minLocal);
    }

    function oninput(e) {
        let val = e.target.value
        value = lin2log(val)
    }

    function lin2log(val) {
		return Math.exp(minv + factor * (val - minLocal));
    }

    function log2lin(val) {
		valueLocal = ( Math.log(val) - minv + factor * minLocal ) / factor;
    }

</script>
<div>
    <input 
        type="range" 
        orient="horizontal"
        min={minLocal}
        max={maxLocal}
        value={valueLocal}
        on:input={oninput}
    />
</div>
<style>
    input[type=range] {
        width: 100px;
    }  
</style>