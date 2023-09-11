const tubeConfig = {
  yellow: {
    bodyGradient: [
      { offset: '0%', stopColor: '#fff3a3', stopOpacity: 0 },
      { offset: '21%', stopColor: '#fff3a4', stopOpacity: 0.008 },
      { offset: '34%', stopColor: '#fff3a6', stopOpacity: 0.039 },
      { offset: '46%', stopColor: '#fff4a9', stopOpacity: 0.098 },
      { offset: '56%', stopColor: '#fff4ad', stopOpacity: 0.188 },
      { offset: '66%', stopColor: '#fff5b3', stopOpacity: 0.286 },
      { offset: '74%', stopColor: '#fff6bb', stopOpacity: 0.42 },
      { offset: '83%', stopColor: '#fff7c3', stopOpacity: 0.576 },
      { offset: '91%', stopColor: '#fff8ce', stopOpacity: 0.757 },
      { offset: '99%', stopColor: '#fffad9', stopOpacity: 0.957 },
      { offset: '100%', stopColor: '#fffadb', stopOpacity: 1 }
    ],
    borderGradient: [
      { offset: 0, stopColor: '#f7941d' },
      { offset: 0.37, stopColor: '#ef4c44' },
      { offset: 1, stopColor: '#fc9a38' }
    ],
    fillGradient: [
      { offset: 0, stopColor: '#f26522' },
      { offset: 0.05, stopColor: '#f26e24' },
      { offset: 0.37, stopColor: '#f5a430' },
      { offset: 0.64, stopColor: '#f7cc39' },
      { offset: 0.86, stopColor: '#f9e43f' },
      { offset: 0.99, stopColor: '#f9ed41' },
      { offset: 1, stopColor: '#f9ed41' }
    ],
    flakeGradient: [
      { offset: 0, stopColor: '#fc9a38' },
      { offset: 1, stopColor: '#ef4c44' }
    ],
    tubeShine: {
      color: [
        'rgba(255, 243, 163, 0)',
        'rgba(255, 243, 164, 0.01)',
        'rgba(255, 243, 166, 0.04)',
        'rgba(255, 244, 169, 0.01)',
        'rgba(255, 244, 173, 0.19)',
        'rgba(255, 245, 179, 0.29)',
        'rgba(255, 246, 187, 0.42)',
        'rgba(255, 247, 195, 0.58)',
        'rgba(255, 248, 206, 0.76)',
        'rgba(255, 250, 217, 0.96)',
        'rgba(255, 250, 219, 1)'
      ],
      locations: [0, 0.21, 0.34, 0.46, 0.56, 0.66, 0.74, 0.83, 0.91, 0.99, 1]
    },
    bottomCircle: {
      locations: [0, 0.21, 0.35, 0.46, 0.56, 0.66, 0.75, 0.84, 0.9, 0.99, 1],
      colors: [
        'rgba(249, 237, 65, 0)',
        'rgba(249, 237, 65, 0.01)',
        'rgba(249, 237, 65, 0.05)',
        'rgba(249, 237, 65, 0.11)',
        'rgba(249, 237, 65, 0.19)',
        'rgba(249, 237, 65, 0.30)',
        'rgba(249, 237, 65, 0.43)',
        'rgba(249, 237, 65, 0.59)',
        'rgba(249, 237, 65, 0.76)',
        'rgba(249, 237, 65, 0.98)',
        'rgba(249, 237, 65, 1)'
      ]
    }
  },
  blue: {
    bodyGradient: [
      { offset: 0, stopColor: '#eccdff', stopOpacity: 0 },
      { offset: 0.2, stopColor: '#eccdff', stopOpacity: 0.01 },
      { offset: 0.33, stopColor: '#eccdff', stopOpacity: 0.05 },
      { offset: 0.45, stopColor: '#eccdff', stopOpacity: 0.11 },
      { offset: 0.55, stopColor: '#eccdff', stopOpacity: 0.19 },
      { offset: 0.65, stopColor: '#eccdff', stopOpacity: 0.3 },
      { offset: 0.74, stopColor: '#eccdff', stopOpacity: 0.43 },
      { offset: 0.83, stopColor: '#eccdff', stopOpacity: 0.59 },
      { offset: 0.91, stopColor: '#eccdff', stopOpacity: 0.78 },
      { offset: 0.99, stopColor: '#eccdff', stopOpacity: 0.98 },
      { offset: 1, stopColor: '#eccdff', stopOpacity: 1 }
    ],
    borderGradient: [
      { offset: 0, stopColor: '#976bd6' },
      { offset: 0.37, stopColor: '#834b9b' },
      { offset: 1, stopColor: '#ab8ed6' }
    ],
    fillGradient: [
      { offset: 0, stopColor: '#834b9b' },
      { offset: 0.26, stopColor: '#844d9f' },
      { offset: 0.52, stopColor: '#8854ab' },
      { offset: 0.78, stopColor: '#8f5fbf' },
      { offset: 0.99, stopColor: '#976bd6' }
    ],
    flakeGradient: [
      { offset: 0, stopColor: '#834b9b' },
      { offset: 1, stopColor: '#432694' }
    ],
    tubeShine: {
      color: [
        'rgba(236, 205, 255, 0)',
        'rgba(236, 205, 255, 0.01)',
        'rgba(236, 205, 255, 0.03)',
        'rgba(236, 205, 255, 0.08)',
        'rgba(236, 205, 255, 0.15)',
        'rgba(236, 205, 255, 0.23)',
        'rgba(236, 205, 255, 0.34)',
        'rgba(236, 205, 255, 0.47)',
        'rgba(236, 205, 255, 0.61)',
        'rgba(236, 205, 255, 0.78)',
        'rgba(236, 205, 255, 0.96)',
        'rgba(236, 205, 255, 1)'
      ],
      locations: [
        0,
        0.37,
        0.51,
        0.6,
        0.68,
        0.75,
        0.8,
        0.86,
        0.91,
        0.95,
        0.99,
        1
      ]
    },
    bottomCircle: {
      locations: [0, 0.21, 0.35, 0.48, 0.59, 0.69, 0.79, 0.88, 0.97, 1],
      colors: [
        'rgba(151, 107, 214, 0)',
        'rgba(151, 107, 214, 0.01)',
        'rgba(151, 107, 214, 0.05)',
        'rgba(151, 107, 214, 0.13)',
        'rgba(151, 107, 214, 0.23)',
        'rgba(151, 107, 214, 0.36)',
        'rgba(151, 107, 214, 0.52)',
        'rgba(151, 107, 214, 0.71)',
        'rgba(151, 107, 214, 0.92)',
        'rgba(151, 107, 214, 1)'
      ]
    }
  },
  green: {
    bodyGradient: [
      { offset: 0, stopColor: '#e9f2ec', stopOpacity: 0 },
      { offset: 0.39, stopColor: '#e6f1eb', stopOpacity: 0.01 },
      { offset: 0.54, stopColor: '#deefe8', stopOpacity: 0.05 },
      { offset: 0.65, stopColor: '#ceebe2', stopOpacity: 0.11 },
      { offset: 0.74, stopColor: '#b8e5d9', stopOpacity: 0.2 },
      { offset: 0.82, stopColor: '#9bdece', stopOpacity: 0.32 },
      { offset: 0.89, stopColor: '#77d4c0', stopOpacity: 0.46 },
      { offset: 0.95, stopColor: '#4ecab1', stopOpacity: 0.63 },
      { offset: 1, stopColor: '#25bfa1', stopOpacity: 0.8 }
    ],
    borderGradient: [
      { offset: 0, stopColor: '#25bfa1' },
      { offset: 0.37, stopColor: '#257049' },
      { offset: 1, stopColor: '#25bfa1' }
    ],
    fillGradient: [
      { offset: 0, stopColor: '#1ca6a0' },
      { offset: 0.4, stopColor: '#1daaa0' },
      { offset: 0.8, stopColor: '#22b6a1' },
      { offset: 0.99, stopColor: '#25bfa1' }
    ],
    flakeGradient: [
      { offset: 0, stopColor: '#25bfa1' },
      { offset: 0.27, stopColor: '#219ea1' },
      { offset: 0.56, stopColor: '#1e83a0' },
      { offset: 0.81, stopColor: '#1d72a0' },
      { offset: 1, stopColor: '#1c6ca0' }
    ],
    tubeShine: {
      color: [
        'rgba(115, 232, 173, 0)',
        'rgba(115, 232, 173, 0.01)',
        'rgba(115, 232, 173, 0.04)',
        'rgba(115, 232, 173, 0.09)',
        'rgba(115, 232, 173, 0.16)',
        'rgba(115, 232, 173, 0.26)',
        'rgba(115, 232, 173, 0.37)',
        'rgba(115, 232, 173, 0.51)',
        'rgba(115, 232, 173, 0.68)',
        'rgba(115, 232, 173, 0.85)',
        'rgba(115, 232, 173, 1)'
      ],
      locations: [0, 0.38, 0.52, 0.61, 0.69, 0.76, 0.82, 0.87, 0.92, 0.97, 1]
    },
    bottomCircle: {
      locations: [0, 0.22, 0.37, 0.5, 0.62, 0.73, 0.83, 0.93, 1],
      colors: [
        'rgba(115, 232, 173, 0)',
        'rgba(115, 232, 173, 0.01)',
        'rgba(115, 232, 173, 0.05)',
        'rgba(115, 232, 173, 0.12)',
        'rgba(115, 232, 173, 0.21)',
        'rgba(115, 232, 173, 0.33)',
        'rgba(115, 232, 173, 0.48)',
        'rgba(115, 232, 173, 0.65)',
        'rgba(115, 232, 173, 0.8)'
      ]
    }
  }
}

export default tubeConfig
