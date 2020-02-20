function Decoder(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var decoded = {};

  // Based on https://stackoverflow.com/a/37471538 by Ilya Bursov
  function bytesToFloat(bytes) {
    // JavaScript bitwise operators yield a 32 bit integer, not a float.
    // Assume LSB (least significant byte first).
    var bits = bytes[3]<<24 | bytes[2]<<16 | bytes[1]<<8 | bytes[0];
    var sign = (bits>>>31 === 0) ? 1.0 : -1.0;
    var e = bits>>>23 & 0xff;
    var m = (e === 0) ? (bits & 0x7fffff)<<1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
  }  
      
  // Decode temp and humidity
  //if (port === 2) {
      // bytes 0 - 3 are temp reading (float)
      decoded.temp = bytesToFloat(bytes.slice(0,4));
      
      // bytes 4 - 7 are humidity reading (float)
      decoded.humidity = bytesToFloat(bytes.slice(4,8));
  //}
  
  // convert bytes to text on port 1; FOR TESTING ONLY
  //if (port === 1) {
  //    decoded.msg = String.fromCharCode.apply(null, bytes);
  //}
  
  return decoded;
  
}
  