//! Unpadded base64url, matching the CKVF Dart codec.

const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

#[derive(Debug)]
pub struct B64Error(pub String);

pub fn encode(bytes: &[u8]) -> String {
    let mut out = String::new();
    let mut i = 0;
    while i < bytes.len() {
        let a = bytes[i] as u32;
        let b = if i + 1 < bytes.len() { bytes[i + 1] as u32 } else { 0 };
        let c = if i + 2 < bytes.len() { bytes[i + 2] as u32 } else { 0 };
        let triple = (a << 16) | (b << 8) | c;
        out.push(ALPHABET[((triple >> 18) & 63) as usize] as char);
        out.push(ALPHABET[((triple >> 12) & 63) as usize] as char);
        if i + 1 < bytes.len() {
            out.push(ALPHABET[((triple >> 6) & 63) as usize] as char);
        }
        if i + 2 < bytes.len() {
            out.push(ALPHABET[(triple & 63) as usize] as char);
        }
        i += 3;
    }
    out
}

pub fn decode(s: &str) -> Result<Vec<u8>, B64Error> {
    if s.bytes().any(|b| !is_alphabet(b)) || s.contains('=') {
        return Err(B64Error("padded or non-base64url encoding".into()));
    }
    if s.len() % 4 == 1 {
        return Err(B64Error("invalid base64url length".into()));
    }
    let mut table = [255u8; 128];
    for (i, byte) in ALPHABET.iter().enumerate() {
        table[*byte as usize] = i as u8;
    }
    let len = s.len() * 3 / 4;
    let mut out = vec![0u8; len];
    let chars = s.as_bytes();
    let mut o = 0;
    let mut i = 0;
    while i < chars.len() {
        let c0 = lookup(&table, chars, i)?;
        let c1 = lookup(&table, chars, i + 1)?;
        let c2 = if i + 2 < chars.len() { lookup(&table, chars, i + 2)? } else { 0 };
        let c3 = if i + 3 < chars.len() { lookup(&table, chars, i + 3)? } else { 0 };
        let triple = ((c0 as u32) << 18) | ((c1 as u32) << 12) | ((c2 as u32) << 6) | (c3 as u32);
        if o < len {
            out[o] = ((triple >> 16) & 255) as u8;
            o += 1;
        }
        if o < len && i + 2 < chars.len() {
            out[o] = ((triple >> 8) & 255) as u8;
            o += 1;
        }
        if o < len && i + 3 < chars.len() {
            out[o] = (triple & 255) as u8;
            o += 1;
        }
        i += 4;
    }
    Ok(out)
}

fn is_alphabet(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'-' || b == b'_'
}

fn lookup(table: &[u8; 128], chars: &[u8], index: usize) -> Result<u8, B64Error> {
    if index >= chars.len() {
        return Err(B64Error("invalid base64url character".into()));
    }
    let c = chars[index];
    if c >= 128 || table[c as usize] == 255 {
        return Err(B64Error("invalid base64url character".into()));
    }
    Ok(table[c as usize])
}

#[cfg(test)]
mod tests {
    use super::{decode, encode};

    #[test]
    fn round_trip() {
        let raw = b"hello vault";
        let encoded = encode(raw);
        assert!(!encoded.contains('='));
        assert!(!encoded.contains('+'));
        assert_eq!(decode(&encoded).unwrap(), raw);
    }

    #[test]
    fn rejects_padding() {
        assert!(decode("YQ==").is_err());
    }
}
