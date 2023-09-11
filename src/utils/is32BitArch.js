import React from 'react'

const IdentifySystemArchitecture = () => 
{
    var _to_check = [] ;
    if ( window.navigator.cpuClass ) _to_check.push( ( window.navigator.cpuClass + "" ).toLowerCase() ) ;
    if ( window.navigator.platform ) _to_check.push( ( window.navigator.platform + "" ).toLowerCase() ) ;
    if ( navigator.userAgent ) _to_check.push( ( navigator.userAgent + "" ).toLowerCase() ) ;
    var _64bits_signatures = [ "x86_64", "x86-64", "Win64", "x64;", "amd64", "AMD64", "WOW64", "x64_64", "ia64", "sparc64", "ppc64", "IRIX64", 'MacIntel'] ;
    var _bits = 32, _i, _c ;
    outer_loop:
    for( _c = 0 ; _c < _to_check.length ; _c++ )
    {
        for( _i = 0 ; _i < _64bits_signatures.length ; _i++ )
        {
            if ( _to_check[_c].indexOf( _64bits_signatures[_i].toLowerCase() ) !== -1 )
            {
            _bits = 64 ;
            break outer_loop;
            }
        }
    }
    return _bits;
}

export const isIPad = () => {
    if (typeof window !== 'undefined') { 
        const ua = window.navigator.userAgent.toLowerCase();
        return (ua.indexOf('ipad') > -1 || ua.indexOf('macintosh') > -1) && 'ontouchend' in document;
    }
    return false;
}

const is32BitArch = () => {
    // Globally using 32 bit Editor for now.
    return true
    // return IdentifySystemArchitecture() === 32;
}

export default is32BitArch