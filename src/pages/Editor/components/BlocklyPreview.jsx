import React from "react";
import { BlocklyWorkspace } from "tekie-blockly";
import Blockly from "blockly";

import { decodeBase64 } from "../../../utils/base64Utility";

const blocklyWorkspaceConfiguration = {
	toolbox: null,
	readOnly: true,
	zoom: false,
	grid: {
		spacing: 2,
		length: 2,
		colour: "#F2F4F6",
		snap: true,
	},
    move: false,
};

const BlocklyPreview = ({ code, workspaceConfiguration }) => {
	return (
		<BlocklyWorkspace
			key={code}
			useDefaultToolbox
			workspaceConfiguration={workspaceConfiguration || blocklyWorkspaceConfiguration}
			blocklyKey="0"
			customTheme={Blockly.Theme.TekiePlayground}
			onInject={(e) => {}}
			initialXml={decodeBase64(code)}
		/>
	);
};

export default BlocklyPreview;
