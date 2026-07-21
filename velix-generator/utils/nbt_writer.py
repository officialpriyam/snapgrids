"""
Lightweight NBT writer for Minecraft Sponge Schematic v2 format.
No external dependencies - uses only struct and gzip.
"""
import struct
import gzip
from io import BytesIO


# NBT tag type constants
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


class NBTWriter:
    """Minimal NBT binary writer."""

    def __init__(self):
        self.buf = BytesIO()

    def _write_tag_header(self, tag_type: int, name: str):
        self.buf.write(struct.pack('>b', tag_type))
        name_bytes = name.encode('utf-8')
        self.buf.write(struct.pack('>h', len(name_bytes)))
        self.buf.write(name_bytes)

    def write_byte(self, name: str, value: int):
        self._write_tag_header(TAG_BYTE, name)
        self.buf.write(struct.pack('>b', value))

    def write_short(self, name: str, value: int):
        self._write_tag_header(TAG_SHORT, name)
        self.buf.write(struct.pack('>h', value))

    def write_int(self, name: str, value: int):
        self._write_tag_header(TAG_INT, name)
        self.buf.write(struct.pack('>i', value))

    def write_long(self, name: str, value: int):
        self._write_tag_header(TAG_LONG, name)
        self.buf.write(struct.pack('>q', value))

    def write_float(self, name: str, value: float):
        self._write_tag_header(TAG_FLOAT, name)
        self.buf.write(struct.pack('>f', value))

    def write_double(self, name: str, value: float):
        self._write_tag_header(TAG_DOUBLE, name)
        self.buf.write(struct.pack('>d', value))

    def write_string(self, name: str, value: str):
        self._write_tag_header(TAG_STRING, name)
        value_bytes = value.encode('utf-8')
        self.buf.write(struct.pack('>h', len(value_bytes)))
        self.buf.write(value_bytes)

    def write_byte_array(self, name: str, data: bytes):
        self._write_tag_header(TAG_BYTE_ARRAY, name)
        self.buf.write(struct.pack('>i', len(data)))
        self.buf.write(data)

    def write_int_array(self, name: str, values: list):
        self._write_tag_header(TAG_INT_ARRAY, name)
        self.buf.write(struct.pack('>i', len(values)))
        for v in values:
            self.buf.write(struct.pack('>i', v))

    def begin_compound(self, name: str):
        self._write_tag_header(TAG_COMPOUND, name)

    def end_compound(self):
        self.buf.write(struct.pack('>b', TAG_END))

    def begin_list(self, name: str, element_type: int, length: int):
        self._write_tag_header(TAG_LIST, name)
        self.buf.write(struct.pack('>b', element_type))
        self.buf.write(struct.pack('>i', length))

    def get_bytes(self) -> bytes:
        return self.buf.getvalue()


def write_varint(value: int) -> bytes:
    """Encode an integer as a varint."""
    result = bytearray()
    while True:
        byte = value & 0x7F
        value >>= 7
        if value != 0:
            byte |= 0x80
        result.append(byte)
        if value == 0:
            break
    return bytes(result)


def write_schematic(
    blocks: list,
    size: int,
    output_path: str,
):
    """
    Write a Sponge Schematic v2 (.schem) file.

    blocks: list of dicts with 'x', 'y', 'z', 'id' keys
    size: max dimension
    output_path: path to write the .schem file
    """
    # Build position -> block_id map
    block_map = {}
    for b in blocks:
        block_map[(b['x'], b['y'], b['z'])] = b['id']

    # Build palette (blockstate string -> index)
    palette = {}
    next_idx = 0
    for b in blocks:
        bid = b['id']
        if bid not in palette:
            palette[bid] = next_idx
            next_idx += 1
    if 'minecraft:air' not in palette:
        palette['minecraft:air'] = next_idx

    # Build block data (varint-encoded palette indices)
    block_data = bytearray()
    for y in range(size):
        for z in range(size):
            for x in range(size):
                block_id = block_map.get((x, y, z), 'minecraft:air')
                idx = palette.get(block_id, 0)
                block_data.extend(write_varint(idx))

    # Build NBT
    w = NBTWriter()

    # Root compound
    w.begin_compound('Schematic')

    # Metadata
    w.write_int('Version', 2)
    w.write_int('DataVersion', 3955)

    # Dimensions
    w.write_short('Width', size)
    w.write_short('Height', size)
    w.write_short('Length', size)
    w.write_int_array('Offset', [0, 0, 0])

    # Palette
    w.begin_compound('Palette')
    for blockstate, idx in palette.items():
        w.write_int(blockstate, idx)
    w.end_compound()

    w.write_int('PaletteMax', len(palette))

    # Block data
    w.write_byte_array('BlockData', bytes(block_data))

    # Block entities (empty list)
    w.begin_list('BlockEntities', TAG_COMPOUND, 0)

    # Entities (empty list)
    w.begin_list('Entities', TAG_COMPOUND, 0)

    w.end_compound()  # end Schematic

    # Write gzipped
    raw = w.get_bytes()
    with gzip.open(output_path, 'wb') as f:
        f.write(raw)

    return output_path
