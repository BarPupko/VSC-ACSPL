import * as vscode from 'vscode';

/**
 * Completion provider for ACSPL+ snippets with custom icons
 */
export class ACSPLSnippetProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.CompletionItem[] {
        const snippets: vscode.CompletionItem[] = [];

        // ============================================================
        // CONTROL FLOW STRUCTURES - Snippet Kind
        // ============================================================

        // LOOP command
        const loopSnippet = new vscode.CompletionItem('LOOP', vscode.CompletionItemKind.Snippet);
        loopSnippet.insertText = new vscode.SnippetString('LOOP ${1:condition}\n\t$0\nEND');
        loopSnippet.documentation = new vscode.MarkdownString('LOOP COMMAND - Repeats code block');
        loopSnippet.detail = '📄 ACSPL+ Loop Structure';
        snippets.push(loopSnippet);

        // WHILE command
        const whileSnippet = new vscode.CompletionItem('WHILE', vscode.CompletionItemKind.Snippet);
        whileSnippet.insertText = new vscode.SnippetString('WHILE (${1:condition})\n\t$0\nEND');
        whileSnippet.documentation = new vscode.MarkdownString('WHILE COMMAND - Repeats while condition is true');
        whileSnippet.detail = '📄 ACSPL+ While Loop';
        snippets.push(whileSnippet);

        // IF command
        const ifSnippet = new vscode.CompletionItem('IF', vscode.CompletionItemKind.Snippet);
        ifSnippet.insertText = new vscode.SnippetString('if (${1:condition})\n\t$0\nEND');
        ifSnippet.documentation = new vscode.MarkdownString('IF COMMAND - Conditional execution');
        ifSnippet.detail = '📄 ACSPL+ If Statement';
        snippets.push(ifSnippet);

        // IF-ELSE command
        const ifelseSnippet = new vscode.CompletionItem('IFELSE', vscode.CompletionItemKind.Snippet);
        ifelseSnippet.insertText = new vscode.SnippetString('if (${1:condition})\n\t${2}\nELSE\n\t${0}\nEND');
        ifelseSnippet.documentation = new vscode.MarkdownString('IF-ELSE COMMAND - Conditional with alternative');
        ifelseSnippet.detail = '📄 ACSPL+ If-Else Statement';
        snippets.push(ifelseSnippet);

        // SWITCH command
        const switchSnippet = new vscode.CompletionItem('Switch', vscode.CompletionItemKind.Snippet);
        switchSnippet.insertText = new vscode.SnippetString(
            'int ${1:intVar} = ${2:23}\n' +
            'SWITCH(${1:intVar} - ${3:2})\n' +
            '\tCASE ${4:20}:\n' +
            '\t\tDISP "${5:CASE 20}"\n' +
            '\t\tEND; !break\n' +
            '\tCASE ${6:21}:\n' +
            '\t\tDISP "${7:CASE 21}"\n' +
            '\t\t!no break\n' +
            '\tDEFAULT:\n' +
            '\t\tDISP "${8:DEFAULT}"\n' +
            '\t\tEND\n' +
            'END\n' +
            'STOP'
        );
        switchSnippet.documentation = new vscode.MarkdownString('SWITCH COMMAND - Multi-way conditional');
        switchSnippet.detail = '📄 ACSPL+ Switch Statement';
        snippets.push(switchSnippet);

        // BLOCK command
        const blockSnippet = new vscode.CompletionItem('BLOCK', vscode.CompletionItemKind.Snippet);
        blockSnippet.insertText = new vscode.SnippetString('BLOCK !block runs all code until it\'s finished\n\t$0\nEND');
        blockSnippet.documentation = new vscode.MarkdownString('BLOCK...END - Executes all code until finished');
        blockSnippet.detail = '📄 ACSPL+ Block Structure';
        snippets.push(blockSnippet);

        // ============================================================
        // FUNCTIONS AND LABELS - Function Kind
        // ============================================================

        // Function
        const functionSnippet = new vscode.CompletionItem('Function_1Parmeter', vscode.CompletionItemKind.Function);
        functionSnippet.insertText = new vscode.SnippetString(
            '${1|int,real,string|} ${2:function}(${3|int,real,string|} ${4|ref,x|}){\n' +
            '\t$LINE_COMMENT code\n' +
            '\t${0}\n' +
            '}'
        );
        functionSnippet.documentation = new vscode.MarkdownString('Function with 1 parameter');
        functionSnippet.detail = 'ƒ ACSPL+ Function Declaration';
        snippets.push(functionSnippet);

        // Label with RET
        const labelSnippet = new vscode.CompletionItem('Label Syntax', vscode.CompletionItemKind.Function);
        labelSnippet.insertText = new vscode.SnippetString(
            '!CALL calls a subroutine according to a specified label. All subroutines must begin with a label and\n' +
            '!conclude with RET.\n' +
            'LABEL_${1:name}: !label name\n' +
            '\t${0}\n' +
            'RET'
        );
        labelSnippet.documentation = new vscode.MarkdownString('Label subroutine - must end with RET');
        labelSnippet.detail = 'ƒ ACSPL+ Label/Subroutine';
        snippets.push(labelSnippet);

        // ON...RET (Autoroutine)
        const onRetSnippet = new vscode.CompletionItem('ON...RET', vscode.CompletionItemKind.Event);
        onRetSnippet.insertText = new vscode.SnippetString(
            '!defines an autoroutine. An autoroutine consists of a condition, and a body. Autoroutines\n' +
            '!autoroutine condition is met, the autoroutine interrupts, executes the lines in the body (until RET)\n' +
            '!and then transfers execution control back to the interrupted program line\n' +
            'ON ${1:condition}\n' +
            '\t${0}\n' +
            'RET'
        );
        onRetSnippet.documentation = new vscode.MarkdownString('Autoroutine - interrupts on condition');
        onRetSnippet.detail = '⚡ ACSPL+ Autoroutine';
        snippets.push(onRetSnippet);

        // ============================================================
        // VARIABLES - Variable Kind
        // ============================================================

        // Variable with $ prefix
        const varSnippet = new vscode.CompletionItem('_Var', vscode.CompletionItemKind.Variable);
        varSnippet.insertText = new vscode.SnippetString('\\$${1:MyVar} = ${2:2}');
        varSnippet.documentation = new vscode.MarkdownString('A basic variable with $ prefix');
        varSnippet.detail = '🔤 ACSPL+ Variable';
        snippets.push(varSnippet);

        // String variable
        const stringSnippet = new vscode.CompletionItem('String Syntax', vscode.CompletionItemKind.Variable);
        stringSnippet.insertText = new vscode.SnippetString('String ${1:name}(${2:size})="${3:value}" !<-EXAMPLE-> String name(size)=value');
        stringSnippet.documentation = new vscode.MarkdownString('String variable declaration');
        stringSnippet.detail = '🔤 ACSPL+ String Variable';
        snippets.push(stringSnippet);

        // Global REAL
        const globalRealSnippet = new vscode.CompletionItem('Global Real', vscode.CompletionItemKind.Variable);
        globalRealSnippet.insertText = new vscode.SnippetString('Global REAL ${1:myReal} = ${2:3.14}');
        globalRealSnippet.documentation = new vscode.MarkdownString('Real is a keyword which designates the 64 bit float primitive type.');
        globalRealSnippet.detail = '🔤 ACSPL+ Global Real Variable';
        snippets.push(globalRealSnippet);

        // 1D String Array
        const array1DSnippet = new vscode.CompletionItem('1D String array', vscode.CompletionItemKind.Variable);
        array1DSnippet.insertText = new vscode.SnippetString(
            '!str1 is an array of characters so we will need to use numbers inside the bracket,\n' +
            '!to say how many characters we want to use.\n' +
            'String ${1:str1}(${2:10}) = ("${3:Hello from ACS}")'
        );
        array1DSnippet.documentation = new vscode.MarkdownString('1D String array declaration');
        array1DSnippet.detail = '🔤 ACSPL+ 1D Array';
        snippets.push(array1DSnippet);

        // 2D Array
        const array2DSnippet = new vscode.CompletionItem('2Darray', vscode.CompletionItemKind.Variable);
        array2DSnippet.insertText = new vscode.SnippetString(
            '!${1:arr1} is a 2D array with ${2:12} rows and ${3:4} columns.\n' +
            'Global INT ${1:arr1}(${4:11})(${5:3})'
        );
        array2DSnippet.documentation = new vscode.MarkdownString('2D Integer array declaration');
        array2DSnippet.detail = '🔤 ACSPL+ 2D Array';
        snippets.push(array2DSnippet);

        // ============================================================
        // STRUCTS - Class/Struct Kind
        // ============================================================

        // Basic struct
        const structSnippet = new vscode.CompletionItem('struct', vscode.CompletionItemKind.Class);
        structSnippet.insertText = new vscode.SnippetString('struct ${1:name}{\n\t${0}\n}');
        structSnippet.documentation = new vscode.MarkdownString('ACSPL+ struct declaration');
        structSnippet.detail = '🏛 ACSPL+ Struct';
        snippets.push(structSnippet);

        // Struct example
        const structExSnippet = new vscode.CompletionItem('struct_example', vscode.CompletionItemKind.Class);
        structExSnippet.insertText = new vscode.SnippetString(
            'struct ${1:Example} {\n' +
            '\tint ${2:arr}(${3:10});\n' +
            '\tint ${4:y};\n' +
            '\tint ${5:z};\n' +
            '}'
        );
        structExSnippet.documentation = new vscode.MarkdownString('Example struct with members');
        structExSnippet.detail = '🏛 ACSPL+ Struct Example';
        snippets.push(structExSnippet);

        // ============================================================
        // AXIS COMMANDS - Module Kind
        // ============================================================

        // Enable 1 axis
        const enable1Snippet = new vscode.CompletionItem('enable_1_axis', vscode.CompletionItemKind.Module);
        enable1Snippet.insertText = new vscode.SnippetString(
            'int ${1:x}=${2:1}\n' +
            'ENABLE(${1:x})\n' +
            'commut(${1:x})'
        );
        enable1Snippet.documentation = new vscode.MarkdownString('Enable and commutate 1 axis');
        enable1Snippet.detail = '📦 ACSPL+ Enable 1 Axis';
        snippets.push(enable1Snippet);

        // Enable 2 axes
        const enable2Snippet = new vscode.CompletionItem('enable_2_axis', vscode.CompletionItemKind.Module);
        enable2Snippet.insertText = new vscode.SnippetString(
            'int ${1:x}=${2:1}\n' +
            'int ${3:y}=${4:2}\n' +
            'ENABLE(${1:x},${3:y})\n' +
            'commut(${1:x},${3:y})'
        );
        enable2Snippet.documentation = new vscode.MarkdownString('Enable and commutate 2 axes');
        enable2Snippet.detail = '📦 ACSPL+ Enable 2 Axes';
        snippets.push(enable2Snippet);

        // Enable 3 axes
        const enable3Snippet = new vscode.CompletionItem('enable_3_axis', vscode.CompletionItemKind.Module);
        enable3Snippet.insertText = new vscode.SnippetString(
            'int ${1:x}=${2:1}\n' +
            'int ${3:y}=${4:2}\n' +
            'int ${5:z}=${6:3}\n' +
            'ENABLE(${1:x},${3:y},${5:z})\n' +
            'commut(${1:x},${3:y},${5:z})'
        );
        enable3Snippet.documentation = new vscode.MarkdownString('Enable and commutate 3 axes');
        enable3Snippet.detail = '📦 ACSPL+ Enable 3 Axes';
        snippets.push(enable3Snippet);

        // ============================================================
        // TEMPLATES - File Kind
        // ============================================================

        // Config Test Template
        const configTestSnippet = new vscode.CompletionItem('configTest', vscode.CompletionItemKind.File);
        configTestSnippet.insertText = new vscode.SnippetString(
            '!--////////////////////////////////////////////////////////////\n' +
            '!////////////   Author : ${1:Your Name}                 /////////////////\n' +
            '!////////////   Date:  ${CURRENT_MONTH}/${CURRENT_DATE}/${CURRENT_YEAR} ${CURRENT_HOUR}:${CURRENT_MINUTE}           /////////////////\n' +
            '!////////////   Description: ${2}                   /////////////////\n' +
            '!////////////   Parameters:                        /////////////////\n' +
            '!////////////   - Param1: Description              /////////////////\n' +
            '!////////////   - Param2: Description              /////////////////\n' +
            '!////////////   Returns:                           /////////////////\n' +
            '!////////////   - Description of return value      /////////////////\n' +
            '!////////////////////////////////////////////////////////////\n' +
            '!////////////////////////////////////////////////////////////\n' +
            'int Result = 1\n\n' +
            '!Function Declaration\n\n\n\n\n\n\n\n' +
            '!--Tests----Tests----Tests----Tests----Tests----Tests----Tests--\n\n\n\n' +
            '!////////////////////////////////////////////////////////////\n' +
            '!////////////   TODO:                                       /////////////////\n' +
            '!////////////   - [ ] Task 1                                /////////////////\n' +
            '!////////////   - [ ] Task 2                                /////////////////\n' +
            'STOP'
        );
        configTestSnippet.documentation = new vscode.MarkdownString('ACSPL Code template with comments and test cases');
        configTestSnippet.detail = '📄 ACSPL+ Test Template';
        snippets.push(configTestSnippet);

        // Config Stage Template
        const configStageSnippet = new vscode.CompletionItem('configStage', vscode.CompletionItemKind.File);
        configStageSnippet.insertText = new vscode.SnippetString(
            '!--/////////////////////Stage Configuration/////////////////////\n\n' +
            '!initialization\n\n' +
            'INT X = 0\n' +
            'INT Y = 1\n' +
            'INT Z = 2\n' +
            'ENABLE (X,Y,Z)\n' +
            'VEL(X) = 100                          ! Set maximum velocity\n' +
            'ACC(X) = 1000                         ! Set acceleration\n' +
            'DEC(X) = 1000                         ! Set deceleration\n' +
            'JERK(X) = 10000                       ! Set jerk\n' +
            'KDEC(X) = 10000                       ! Set kill deceleration\n\n' +
            'IF MFLAGS(X).9 = 0\n' +
            'WAIT 10\n' +
            'END\n\n' +
            '!--Tests----Tests----Tests----Tests----Tests----Tests----Tests--\n' +
            'PTP (X), 20\n\n\n' +
            'STOP\n\n' +
            '!--functions----functions----functions----functions----functions----functions----functions--\n'
        );
        configStageSnippet.documentation = new vscode.MarkdownString('Basic Stage configuration template');
        configStageSnippet.detail = '📄 ACSPL+ Stage Config Template';
        snippets.push(configStageSnippet);

        // ============================================================
        // OPERATORS - Operator Kind
        // ============================================================

        // OR operator
        const orSnippet = new vscode.CompletionItem('OR', vscode.CompletionItemKind.Operator);
        orSnippet.insertText = new vscode.SnippetString('|');
        orSnippet.documentation = new vscode.MarkdownString('Logical OR operator');
        orSnippet.detail = '⚡ ACSPL+ OR (|)';
        snippets.push(orSnippet);

        // NOT operator
        const notSnippet = new vscode.CompletionItem('NOT', vscode.CompletionItemKind.Operator);
        notSnippet.insertText = new vscode.SnippetString('^');
        notSnippet.documentation = new vscode.MarkdownString('Logical NOT operator');
        notSnippet.detail = '⚡ ACSPL+ NOT (^)';
        snippets.push(notSnippet);

        // XOR operator
        const xorSnippet = new vscode.CompletionItem('XOR', vscode.CompletionItemKind.Operator);
        xorSnippet.insertText = new vscode.SnippetString('~');
        xorSnippet.documentation = new vscode.MarkdownString('Logical XOR operator');
        xorSnippet.detail = '⚡ ACSPL+ XOR (~)';
        snippets.push(xorSnippet);

        // AND operator
        const andSnippet = new vscode.CompletionItem('AND', vscode.CompletionItemKind.Operator);
        andSnippet.insertText = new vscode.SnippetString('&');
        andSnippet.documentation = new vscode.MarkdownString('Logical AND operator');
        andSnippet.detail = '⚡ ACSPL+ AND (&)';
        snippets.push(andSnippet);

        // ============================================================
        // G-CODE - Enum Kind
        // ============================================================

        // G-Code 1 digit
        const gcode1Snippet = new vscode.CompletionItem('G-Code 1 Digit', vscode.CompletionItemKind.Enum);
        gcode1Snippet.insertText = new vscode.SnippetString('G-0${1}');
        gcode1Snippet.documentation = new vscode.MarkdownString('In acspl, you can use G CODE G0-9.');
        gcode1Snippet.detail = '🔢 ACSPL+ G-Code (1 digit)';
        snippets.push(gcode1Snippet);

        // G-Code 2 digits
        const gcode2Snippet = new vscode.CompletionItem('G-Code 2 Digit', vscode.CompletionItemKind.Enum);
        gcode2Snippet.insertText = new vscode.SnippetString('G-${1:0}${2}');
        gcode2Snippet.documentation = new vscode.MarkdownString('In acspl, you can use G CODE G01-99.');
        gcode2Snippet.detail = '🔢 ACSPL+ G-Code (2 digits)';
        snippets.push(gcode2Snippet);

        // ============================================================
        // TYPE CORRECTIONS - TypeParameter Kind
        // ============================================================

        // float -> real
        const floatSnippet = new vscode.CompletionItem('float', vscode.CompletionItemKind.TypeParameter);
        floatSnippet.insertText = new vscode.SnippetString('real');
        floatSnippet.documentation = new vscode.MarkdownString('In acspl, float does not exist, changing the variable to real.');
        floatSnippet.detail = '⚠️ ACSPL+ uses "real" not "float"';
        snippets.push(floatSnippet);

        // double -> real
        const doubleSnippet = new vscode.CompletionItem('double', vscode.CompletionItemKind.TypeParameter);
        doubleSnippet.insertText = new vscode.SnippetString('real');
        doubleSnippet.documentation = new vscode.MarkdownString('In acspl, double does not exist, changing the variable to real.');
        doubleSnippet.detail = '⚠️ ACSPL+ uses "real" not "double"';
        snippets.push(doubleSnippet);

        // FOR -> LOOP correction
        const forFixSnippet = new vscode.CompletionItem('FOR', vscode.CompletionItemKind.Snippet);
        forFixSnippet.insertText = new vscode.SnippetString('LOOP ${1:condition}\n\t${0}\nEND');
        forFixSnippet.documentation = new vscode.MarkdownString('There is no FOR, only \'loop\'');
        forFixSnippet.detail = '⚠️ ACSPL+ uses "LOOP" not "FOR"';
        snippets.push(forFixSnippet);

        return snippets;
    }
}
