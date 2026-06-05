/** 日本語ラベル */
export default {
  gradeExcellent: '優秀',
  gradeNormal: '普通',
  gradeReject: '不合格',

  evidenceTyping: (len, cpm) => `${len}文字を直接入力、平均${cpm}文字/分`,
  evidencePasteClean: (len) => `${len}文字が一括流入（修正なし）`,
  evidencePasteEdited: (orig, rem, del, ins) => `原文${orig}文字 → 残存${rem}文字（削除${del}、追加${ins}）`,
  evidenceInsertInPaste: (len) => `貼り付け領域内で直接${len}文字入力`,
  evidenceCitation: (len) => `${len}文字の貼り付け、引用/出典表記を検出`,

  heuristicNonlinear: (jumps, total) => `カーソル逆方向移動 ${jumps}回/${total}回（非線形編集）`,
  heuristicThinking: (pauses) => `有効思考停止 ${pauses}回（停止後の修正・逆方向移動を伴う）`,
  heuristicEditQuality: (typo, content) => `誤字修正 ${typo}回、内容修正 ${content}回`,
};
