export function addNumericalPrompts(events) {
  function add(event,prompt,values) {
    events.find(([name]) => name===event)[1].push([prompt,values.join('; ')]);
  }
  const range = n => Array.from({length:n},(_,i)=>i+1);
  // Explicit bounds give each of these open-response questions a complete answer bank.
  for(const divisor of [2,3,4,5,6,7,8,9,10,12,15,16,20,24,25,32]){
    add('Experimental Design',`You plan ${divisor} equal-sized treatment groups. Give a possible total sample size from 1 to 500. Enter an integer.`,
      range(500).filter(n=>n%divisor===0));
    add('Code Craze',`An integer counter from 1 to 500 leaves remainder 1 when divided by ${divisor}. Give one possible value in decimal.`,
      range(500).filter(n=>n%divisor===1));
  }
  for(const increments of [5,6,8,9,10,12,15,18,20,24,30,36,40,45]){
    add('Engineering CAD',`A rotary sketch constraint snaps in steps of ${increments}°. Name a positive whole-number angle below 360° that it can produce. Enter degrees.`,
      range(359).filter(n=>n%increments===0).map(n=>n+'|'+n+' degrees|'+n+'°'));
  }
  for(const bits of range(8).slice(3)){
    add('Code Craze',`Give a decimal integer that fits in an unsigned ${bits}-bit register but does not fit in an unsigned ${bits-1}-bit register.`,
      range(2**(bits-1)).map(n=>n+2**(bits-1)-1));
  }
}
