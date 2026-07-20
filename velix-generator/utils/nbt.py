import struct
import io
import gzip


class NBTPayload:
    TAG_END = 0
    TAG_BYTE = 1
    TAG_SHORT = 2
    TAG_INT = 3
    TAG_LONG = 4
    TAG_FLOAT = 5
    TAG_DOUBLE = 6
    TAG_BYTE_ARRAY = 7
    TAG_STRING = 8
    TAG_LIST = 9
    TAG_COMPOUND = 10
    TAG_INT_ARRAY = 11
    TAG_LONG_ARRAY = 12

    def __init__(self):
        self.buf = io.BytesIO()

    def _write_byte(self, val):
        self.buf.write(struct.pack('>b', val))

    def _write_short(self, val):
        self.buf.write(struct.pack('>h', val))

    def _write_int(self, val):
        self.buf.write(struct.pack('>i', val))

    def _write_long(self, val):
        self.buf.write(struct.pack('>q', val))

    def _write_float(self, val):
        self.buf.write(struct.pack('>f', val))

    def _write_double(self, val):
        self.buf.write(struct.pack('>d', val))

    def _write_string(self, val):
        encoded = val.encode('utf-8')
        self._write_short(len(encoded))
        self.buf.write(encoded)

    def _write_tag_header(self, tag_type, name):
        self._write_byte(tag_type)
        self._write_string(name)

    def _write_value(self, tag_type, value):
        if tag_type == self.TAG_BYTE:
            self._write_byte(value)
        elif tag_type == self.TAG_SHORT:
            self._write_short(value)
        elif tag_type == self.TAG_INT:
            self._write_int(value)
        elif tag_type == self.TAG_LONG:
            self._write_long(value)
        elif tag_type == self.TAG_FLOAT:
            self._write_float(value)
        elif tag_type == self.TAG_DOUBLE:
            self._write_double(value)
        elif tag_type == self.TAG_STRING:
            self._write_string(value)
        elif tag_type == self.TAG_BYTE_ARRAY:
            self._write_int(len(value))
            self.buf.write(bytes(value))
        elif tag_type == self.TAG_INT_ARRAY:
            self._write_int(len(value))
            for v in value:
                self._write_int(v)
        elif tag_type == self.TAG_LONG_ARRAY:
            self._write_int(len(value))
            for v in value:
                self._write_long(v)

    def write_compound(self, name, tags_dict):
        self._write_tag_header(self.TAG_COMPOUND, name)
        for tag_name, (tag_type, value) in tags_dict.items():
            if tag_type == self.TAG_COMPOUND:
                self.write_compound(tag_name, value)
            elif tag_type == self.TAG_LIST:
                self._write_tag_header(self.TAG_LIST, tag_name)
                self._write_byte(value['element_type'])
                self._write_int(len(value['elements']))
                for elem in value['elements']:
                    self._write_value(value['element_type'], elem)
            else:
                self._write_tag_header(tag_type, tag_name)
                self._write_value(tag_type, value)
        self._write_byte(self.TAG_END)

    def get_bytes(self):
        return self.buf.getvalue()


def write_schematic_nbt(schematic_data):
    nbt = NBTPayload()
    root = {}

    root['Version'] = (NBTPayload.TAG_INT, schematic_data.get('version', 2))
    root['DataVersion'] = (NBTPayload.TAG_INT, schematic_data.get('data_version', 3955))

    root['Width'] = (NBTPayload.TAG_SHORT, schematic_data['width'])
    root['Height'] = (NBTPayload.TAG_SHORT, schematic_data['height'])
    root['Length'] = (NBTPayload.TAG_SHORT, schematic_data['length'])

    root['Offset'] = (NBTPayload.TAG_INT_ARRAY, schematic_data.get('offset', [0, 0, 0]))

    palette = {}
    for block_id, idx in schematic_data['palette'].items():
        palette[block_id] = (NBTPayload.TAG_INT, idx)
    root['Palette'] = (NBTPayload.TAG_COMPOUND, palette)
    root['PaletteMax'] = (NBTPayload.TAG_INT, len(schematic_data['palette']))

    root['BlockData'] = (NBTPayload.TAG_BYTE_ARRAY, schematic_data['block_data'])

    if 'block_entities' in schematic_data:
        root['BlockEntities'] = (NBTPayload.TAG_LIST, {
            'element_type': NBTPayload.TAG_COMPOUND,
            'elements': schematic_data['block_entities']
        })

    nbt.write_compound('Schematic', root)
    return nbt.get_bytes()


def write_gzip(data):
    buf = io.BytesIO()
    with gzip.open(buf, 'wb') as f:
        f.write(data)
    return buf.getvalue()
