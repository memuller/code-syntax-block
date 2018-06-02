/**
 * Code Syntax Highlighting Block
 * A gutenberg block that allows inserting code with syntax highlighting.
 */

 /**
 * WordPress dependencies
 */
const { __ } = wp.i18n;
const { addFilter } = wp.hooks;
const { PlainText } = wp.blocks;
const { InspectorControls } = wp.editor;
const { SelectControl, CodeEditor } = wp.components;

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';

const Langs = {
	list: {
		bash: 'Bash (shell)',
		clike: 'C-like',
		css: 'CSS',
		git: 'Git',
		go: 'Go (golang)',
		markup: { name: 'HTML/Markup', mode: 'htmlmixed' },
		javascript: 'JavaScript',
		json: 'JSON',
		markdown: 'Markdown',
		php: 'PHP',
		python: 'Python',
		jsx: 'React JSX',
		sql: 'SQL',
	},

	getName (code) {
		let language = this.list[code];
		return typeof language === 'string' ? language : language.name;
	},

	getEditorMode (code) {
		let language = this.list[code];
		return typeof language === 'string' ? code : language.mode;
	},
}

const addSyntaxToCodeBlock = settings => {
	if ( settings.name !== "core/code" ) {
		return settings;
	}

	const newCodeBlockSettings = {
		...settings,

		attributes: {
			...settings.attributes,
			language: {
				type: 'string',
				selector: 'code',
				source: 'attribute',
				attribute: 'lang',
				default: 'markup'
			},
		},

		edit( { attributes, setAttributes, isSelected, className } ) {

			const editorSettings = () => {
				let settings = { ...window._wpGutenbergCodeEditorSettings };
				settings.codemirror = { ...settings.codemirror };
				settings.codemirror.mode = Langs.getEditorMode(attributes.language);
				return settings;
			};

			const updateLanguage = language => {
				setAttributes({ language });
				attributes.editorInstance.setOption('mode', Langs.getEditorMode(language));
			};
			
			return [
				isSelected && (
					<InspectorControls>
						<SelectControl
							label="Language"
							value={ attributes.language }
							options={ 
								Object.keys(Langs.list).map( lang => (
									{ label: Langs.getName(lang), value: lang }
								) )
							}
							onChange={ updateLanguage }
						/>
					</InspectorControls>
				),
				<div className={ className }>
					<CodeEditor
						value={ attributes.content }
						onChange={ ( content ) => setAttributes( { content } ) }
						placeholder={ __( 'Write code…' ) }
						aria-label={ __( 'Code' ) }
						settings={ editorSettings() }
						editorRef={ ref => attributes.editorInstance = ref }
					/>
					<div class="language-selected">{ Langs.getName(attributes.language) }</div>
				</div>
			];
		},

		save( { attributes } ) {
			const cls = ( attributes.language ) ? "language-" + attributes.language : "";
			return <pre><code lang={ attributes.language } className={ cls }>{ attributes.content }</code></pre>;
		},
	};

	return newCodeBlockSettings;
};

// Register Filter
addFilter(
	"blocks.registerBlockType",
	"mkaz/code-syntax-block",
	addSyntaxToCodeBlock
)
