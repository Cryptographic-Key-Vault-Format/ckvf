//! C ABI loaded by secMail0 and the pubkey SDK.

use std::slice;

use crate::b64;
use crate::jcs;

/// 0 = ok, 1 = bad argument, 2 = invalid input.
#[no_mangle]
pub unsafe extern "C" fn scomm_vault_jcs(
    input: *const u8,
    input_len: usize,
    out_ptr: *mut *mut u8,
    out_len: *mut usize,
) -> i32 {
    let Some(text) = read_utf8(input, input_len) else {
        return 1;
    };
    match jcs::canonicalize_json(&text) {
        Ok(out) => write_bytes(out.into_bytes(), out_ptr, out_len),
        Err(_) => 2,
    }
}

#[no_mangle]
pub unsafe extern "C" fn scomm_vault_b64_encode(
    input: *const u8,
    input_len: usize,
    out_ptr: *mut *mut u8,
    out_len: *mut usize,
) -> i32 {
    if input.is_null() && input_len != 0 || out_ptr.is_null() || out_len.is_null() {
        return 1;
    }
    let bytes = if input_len == 0 {
        &[]
    } else {
        slice::from_raw_parts(input, input_len)
    };
    write_bytes(b64::encode(bytes).into_bytes(), out_ptr, out_len)
}

#[no_mangle]
pub unsafe extern "C" fn scomm_vault_b64_decode(
    input: *const u8,
    input_len: usize,
    out_ptr: *mut *mut u8,
    out_len: *mut usize,
) -> i32 {
    let Some(text) = read_utf8(input, input_len) else {
        return 1;
    };
    match b64::decode(&text) {
        Ok(out) => write_bytes(out, out_ptr, out_len),
        Err(_) => 2,
    }
}

#[no_mangle]
pub unsafe extern "C" fn scomm_vault_free(ptr: *mut u8, len: usize) {
    if ptr.is_null() {
        return;
    }
    drop(Box::from_raw(slice::from_raw_parts_mut(ptr, len)));
}

unsafe fn read_utf8(input: *const u8, input_len: usize) -> Option<String> {
    if input.is_null() && input_len != 0 {
        return None;
    }
    let bytes = if input_len == 0 {
        &[]
    } else {
        slice::from_raw_parts(input, input_len)
    };
    String::from_utf8(bytes.to_vec()).ok()
}

unsafe fn write_bytes(bytes: Vec<u8>, out_ptr: *mut *mut u8, out_len: *mut usize) -> i32 {
    if out_ptr.is_null() || out_len.is_null() {
        return 1;
    }
    let len = bytes.len();
    let boxed = bytes.into_boxed_slice();
    *out_ptr = Box::into_raw(boxed) as *mut u8;
    *out_len = len;
    0
}
