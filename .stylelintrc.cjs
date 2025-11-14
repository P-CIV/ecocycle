module.exports = {
  extends: ["stylelint-config-standard"],
  rules: {
    // Autoriser les at-rules spécifiques à Tailwind CSS et PostCSS
    "at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": [
          "tailwind",
          "apply",
          "variants",
          "responsive",
          "screen",
          "layer",
          "content"
        ]
      }
    ]
  }
};
