/* Bài 7: AudioWorkletProcessor — Bitcrusher (giảm bit depth + giảm sample rate hiệu ứng lo-fi) */
class BitcrusherProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'bits', defaultValue: 8, minValue: 1, maxValue: 16, automationRate: 'k-rate' },
      { name: 'reduction', defaultValue: 1, minValue: 1, maxValue: 50, automationRate: 'k-rate' },
    ];
  }

  constructor() {
    super();
    this._phase = 0;
    this._holdValue = 0;
    this._burstSamplesLeft = 0;
    this.port.onmessage = (event) => {
      if (event.data && event.data.type === 'burst') {
        this._burstSamplesLeft = event.data.samples || 4410;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!output || !output.length) return true;

    const bits = parameters.bits[0];
    const step = Math.pow(0.5, bits); // độ phân giải lượng tử hoá theo số bit
    const reduction = Math.max(1, Math.round(parameters.reduction[0]));

    for (let channel = 0; channel < output.length; channel++) {
      const inputChannel = input && input[channel];
      const outputChannel = output[channel];
      for (let i = 0; i < outputChannel.length; i++) {
        let sample;
        if (this._burstSamplesLeft > 0) {
          sample = Math.random() * 2 - 1; // burst nhiễu trắng, kích hoạt qua port.postMessage
          this._burstSamplesLeft--;
        } else {
          sample = inputChannel ? inputChannel[i] : 0;
        }
        if (this._phase % reduction === 0) {
          // "sample and hold": chỉ lấy mẫu mới mỗi `reduction` sample — mô phỏng giảm sample rate
          this._holdValue = step * Math.round(sample / step); // lượng tử hoá theo `bits`
        }
        outputChannel[i] = this._holdValue;
        this._phase++;
      }
    }
    return true; // giữ processor sống — trả về false sẽ huỷ node
  }
}

registerProcessor('bitcrusher-processor', BitcrusherProcessor);
