/*
  A mapping from type names to NBT type numbers.
  This is NOT just an enum, these values have to stay as they are
  https://minecraft.fandom.com/wiki/NBT_format#TAG_definition
*/
const TagTypes = {
  end: 0,
  byte: 1,
  short: 2,
  int: 3,
  long: 4,
  float: 5,
  double: 6,
  byteArray: 7,
  string: 8,
  list: 9,
  compound: 10,
  intArray: 11,
  longArray: 12,
};

class NBTReader {
  constructor() {
    if (typeof ArrayBuffer === "undefined") {
      throw new Error("Missing required type ArrayBuffer");
    }
    if (typeof DataView === "undefined") {
      throw new Error("Missing required type DataView");
    }
    if (typeof Uint8Array === "undefined") {
      throw new Error("Missing required type Uint8Array");
    }
    this.buffer = null;
    this.dataView = null;
    this.arrayView = null;
    this.offset = null;
  }

  loadBuffer(buffer) {
    this.buffer = buffer;
    this.dataView = new DataView(this.buffer);
    this.arrayView = new Uint8Array(this.buffer);
    this.offset = 0;
  }

  decodeUTF8(bytes) {
    let codepoints = [];
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      if ((byte & 0x80) === 0) {
        // single byte 0x0001 to 0x007F
        codepoints.push(byte);
      } else if ((byte & 0xe0) === 0xc0) {
        // two bytes for 0x0000 and 0x0080 to 0x07FF
        codepoints.push(((byte & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
        i += 1;
      } else if ((byte & 0xf0) === 0xe0) {
        // three bytes for 0x0800 to 0xFFFF
        codepoints.push(((byte & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f));
        i += 2;
      }
    }
    return String.fromCharCode.apply(null, codepoints);
  }

  read(dataType, size) {
    const value = this.dataView[`get${dataType}`](this.offset);
    this.offset += size;
    return value;
  }

  readByType(dataType) {
    switch (dataType) {
      case TagTypes.end: {
        return this.readByType(TagTypes.byte);
      }
      case TagTypes.byte: {
        return this.read("Int8", 1);
      }
      case TagTypes.short: {
        return this.read("Int16", 2);
      }
      case TagTypes.int: {
        return this.read("Int32", 4);
      }
      case TagTypes.long: {
        // NB: special: JS doesn't support native 64 bit ints; returns an array of two 32 bit ints
        return [this.readByType(TagTypes.int), this.readByType(TagTypes.int)];
      }
      case TagTypes.float: {
        return this.read("Float32", 4);
      }
      case TagTypes.double: {
        return this.read("Float64", 8);
      }
      case TagTypes.byteArray: {
        const arrayLength = this.readByType(TagTypes.int);
        const returnArray = this.arrayView.slice(this.offset, this.offset + arrayLength);
        this.offset += arrayLength;
        return returnArray;
      }
      case TagTypes.string: {
        const string_bytes_length = this.readByType(TagTypes.short);
        const string_bytes = this.arrayView.slice(this.offset, this.offset + string_bytes_length);
        this.offset += string_bytes_length;
        return this.decodeUTF8(string_bytes);
      }
      case TagTypes.list: {
        const list_objectType = this.readByType(TagTypes.byte);
        const list_length = this.readByType(TagTypes.int);
        let returnObject = { type: list_objectType, value: [] };
        for (let i = 0; i < list_length; i++) {
          returnObject.value.push(this.readByType(list_objectType));
        }
        return returnObject;
      }
      case TagTypes.compound: {
        let returnObject = {};
        while (true) {
          let tagType = this.readByType(TagTypes.byte);
          if (tagType === TagTypes.end) {
            break;
          } else {
            let key = this.readByType(TagTypes.string);
            let value = this.readByType(tagType);
            returnObject[key] = { type: tagType, value: value };
          }
        }
        return returnObject;
      }
      case TagTypes.intArray: {
        const returnArray = [];
        const array_length = this.readByType(TagTypes.int);
        for (let i = 0; i < array_length; i++) {
          returnArray.push(this.readByType(TagTypes.int));
        }
        return returnArray;
      }
      case TagTypes.longArray: {
        const returnArray = [];
        const array_length = this.readByType(TagTypes.int);
        for (let i = 0; i < array_length; i++) {
          returnArray.push(this.readByType(TagTypes.long));
          // NB this is an array of length 2 arrays of ints as specified in case:long
        }
        return returnArray;
      }
      default: {
        throw new Error(`Unknown data type ${dataType}`);
      }
    }
  }

  getData() {
    this.readByType(TagTypes.byte);
    return {
      name: this.readByType(TagTypes.string),
      value: this.readByType(TagTypes.compound),
    }; // NB this reads the top-level compound which does not have a terminating null byte
  }
}

export default NBTReader;
