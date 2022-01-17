module.exports = {
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "no-trailing-spaces": "error",
    "react/jsx-no-target-blank": [
      "error",
      {
        "allowReferrer": true
      }
    ],
    "import/no-anonymous-default-export": "off",
    "no-mixed-operators": "off",
    "jsx-a11y/alt-text": "off",
  },
}
