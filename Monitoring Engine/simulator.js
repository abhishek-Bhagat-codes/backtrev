const axios = require("axios");

const points = [

 {lat:28.6139,lng:77.2090},
 {lat:28.6142,lng:77.2100},
 {lat:28.6146,lng:77.2110},
 {lat:28.6150,lng:77.2120},
 

 // deviated point
 {lat:28.6200,lng:77.2300}

];

async function run(){

  for(let p of points){

    const res = await axios.post(
      "http://localhost:3000/location",
      p
    );

    console.log("Deviation:",res.data.deviation);

    await new Promise(r=>setTimeout(r,3000));
  }

}

run();