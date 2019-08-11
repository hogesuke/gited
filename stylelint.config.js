module.exports = {
  plugins: [
    'stylelint-scss'
  ],
  extends: 'stylelint-config-standard',
  rules: {
    // 'no-descending-specificity': null, // FIXME: 検出数が多すぎてすぐには修正できないため一旦offとする
    // 'font-family-no-missing-generic-family-keyword': null,
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
  }
}
