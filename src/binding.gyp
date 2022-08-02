{
  "targets": [
    {
      "target_name": "ACSC_LIBRARY",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [
        "../ACSC/ACSC.h",
        "../ACSC/ACSCL_x64.LIB"
        "../ACSC/ACSCL_x86.LIB"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    }
  ]
}