$.widget( "mathquill.mathquillToolbars", {
	mq_span: undefined,
	mq_input: undefined,
	record_timer: undefined,
	saved_equations: [],
	// Todo: Add undo and redo support

	default_buttons: {
		plus: { label: '+', latex: '+', description: 'Addition', cmd: 'cmd' },
		minus: { label: '-', latex: '-', description: 'Subtraction', cmd: 'cmd' },
		times: { label: '\\times', latex: '\\times', description: 'Multiplication', cmd: 'cmd' },
		divide: { label: '\\divide', latex: '\\divide', description: 'Division', cmd: 'cmd' },
		equal: { label: '=', latex: '=', description: 'Equal', cmd: 'cmd' },
		lt: { label: '<', latex: '<', description: 'Less Than', cmd: 'cmd' },
		gt: { label: '>', latex: '>', description: 'Greater Than', cmd: 'cmd' },
		lte: { label: '\\le', latex: '\le', description: 'Less Than or Equal To', cmd: 'cmd' },
		gte: { label: '\\ge', latex: '\\ge', description: 'Greater Than or Equal To', cmd: 'cmd' },
		frac: { label: '\\frac {x}{y}', latex: '\\frac', description: 'Fraction', cmd: 'cmd' },
		parens: { label: '(x)', latex: '(', description: 'Parentheses', cmd: 'cmd' },
		brackets: { label: '[x]', latex: '[', description: 'Brackets', cmd: 'cmd' },
		exponent: { label: '2^{1}', latex: '^{1}', description: 'Exponent', cmd: 'write' },
		subscript: { label: '2_{1}', latex: '_{1}', description: 'Subscript', cmd: 'write' },
		absolute: { label: '|x|', latex: '|', description: 'Absolute Value', cmd: 'cmd' },
		pi: { label: '\\pi', latex: '\\pi', description: 'Pi', cmd: 'write' },
		sqrt: { label: '\\sqrt x', latex: '\\sqrt', description: 'Square Root', cmd: 'cmd' },
		sqrt2: { label: '\\sqrt[x]{y}', latex: '\\sqrt[x]{y}', description: 'Square Root Alt', cmd: 'write' },
		imaginary: { label: 'i', latex: 'i', description: 'Imaginary Number', cmd: 'write' },
		degrees: { label: '\\deg', latex: '\\deg', description: 'Degrees', cmd: 'write' },
		theta: { label: '\\theta', latex: '\\theta', description: 'Theta', cmd: 'write' },
		phi: { label: '\\phi', latex: '\\phi', description: 'Phi', cmd: 'write' },
		sin: { label: '\\sin', latex: '\\sin', description: 'Sin', cmd: 'write' },
		cos: { label: '\\cos', latex: '\\cos', description: 'Cos', cmd: 'write' },
		tan: { label: '\\tan', latex: '\\tan', description: 'Tan', cmd: 'write' },
		arcsin: { label: '\\arcsin', latex: '\\arcsin', description: 'Arc Sin', cmd: 'write' },
		arccos: { label: '\\arccos', latex: '\\arccos', description: 'Arc Cos', cmd: 'write' },
		arctan: { label: '\\arctan', latex: '\\arctan', description: 'Arc Tan', cmd: 'write' },
		x: { label: 'x', latex: 'x', description: 'x', cmd: 'write' },
		y: { label: 'y', latex: 'y', description: 'y', cmd: 'write' }
	},

	options: {
		record_timer_delay: 1000,
		num_undos: 5,
		buttons: {},
		toolbars: ['operators', 'structure', 'symbols', 'calculus', 'variables'],
		operators: ['plus', 'minus', 'times', 'divide', 'equal', 'lt', 'gt', 'lte', 'gte'],
		structure: ['frac', 'parens', 'brackets', 'exponent', 'subscript', 'absolute'],
		symbols: ['pi', 'sqrt', 'sqrt2', 'imaginary', 'degrees', 'theta', 'phi'],
		calculus: ['sin', 'cos', 'tan', 'arcsin', 'arccos', 'arctan'],
		variables: ['x', 'y']
	},

	_create: function() {
		// Init from hidden
		this.mq_span = $('.mathquill-display .mathquill-editable', this.element);
		this.mq_input = $('.mathquill-input input', this.element);
		var latex = this.mq_input.val();
		if (latex.length !== 0) {
			this.mq_span.mathquill('write', latex);
			this.saved_equations.push(latex);
		}
		else {
			this.saved_equations.push('');
		}

		this._buildToolbars();
		this._bindEvents();
	},

	_buildToolbars: function() {
		var toolbar_html = '';
		if (this.options.toolbars.length != 0) {
			for (var i = 0; i <= this.options.toolbars.length - 1; i++) {
				var toolbar_name = this.options.toolbars[i];
				if (this.options[toolbar_name] == undefined) {
					console.error("Mathquill Toolbars: Toolbar '" + toolbar_name + "' not found.");
					continue;
				}
				var toolbar = this.options[toolbar_name];
				toolbar_html += '<div class="mathquill-toolbar btn-group">';
				for (var x = 0; x <= toolbar.length - 1; x++) {
					var btn_name = toolbar[x];
					var btn_opt;
					if (this.default_buttons[btn_name] !== undefined) {
						btn_opt = this.default_buttons[btn_name];
					}
					else if (this.options.buttons[btn_name] !== undefined) {
						btn_opt = this.options.buttons[btn_name];
					}
					else {
						console.error("Mathquill Toolbars: Button '" + btn_name + "' not found.");
					}
					toolbar_html += '<button class="btn btn-small" data-fragment="' + btn_opt.name + '" data-latex="' + btn_opt.latex + '" data-cmd="' + btn_opt.cmd + '" title="' + btn_opt.description + '"><span class="mathquill-embedded-latex">' + btn_opt.label + '</span></button>';
				};
				toolbar_html += '</div>';
			};
		}
		this.element.prepend(toolbar_html);
		$('.mathquill-toolbar .mathquill-embedded-latex', this.element).mathquill();
	},

	_bindEvents: function() {
		// Save
		this.element.on('save', function() {
			$(this).mathquillToolbars('save', 'foo');
		});

		// Toolbar clicks
		$(".mathquill-toolbar .btn", this.element).on( "click", function() {
			var btn = $(this);
			btn.parents('.mathquill-container').mathquillToolbars('insert', btn);
		});

		// MQ Keydown / Keypress
		this.mq_span.on( "keydown", function() {
			$(this).parents('.mathquill-container').mathquillToolbars('setSaveTimer');
		}).on( "keypress", function() {
			$(this).parents('.mathquill-container').mathquillToolbars('setSaveTimer');
		});
	},

	insert: function(btn) {
		var editor = $('.mathquill-editable').focus();
		var latex = btn.data('latex');
		if (latex) {
			editor.mathquill(btn.data('cmd'), latex).focus();
			this.setSaveTimer();
		}
	},

	setSaveTimer: function() {
		if (this.saveTimer() !== undefined) return true;
		
		function callSave(obj) {
			obj.element.trigger("save");
		}
		var timeout = setTimeout(callSave.bind(this, this), this.options.record_timer_delay);
		this.saveTimer(timeout);
	},

	saveTimer: function(timer) {
		if (timer === undefined) {
			return this.record_timer;
		}

		this.record_timer = timer;
	},

	save: function() {
		var new_latex = this.mq_span.mathquill('latex');
		var curr_len = this.saved_equations.length;
		if (curr_len === 0 || this.saved_equations[curr_len - 1] !== new_latex) {
			curr_len = this.saved_equations.push(new_latex);
			this.val(new_latex);
			if (curr_len > this.options.num_undos) {
				this.saved_equations.shift();
			}
		}
		// Clear out Save Timer
		this.record_timer = undefined;
	},

	val: function(value) {
		var curr_len = this.saved_equations.length;
		if (value === undefined) {
			if (curr_len !== 0) return this.saved_equations[curr_len - 1];
			return null;
		}

		if (this.mq_input.val() != value) {
			if (curr_len === 0) curr_len = this.saved_equations.push(value);
			this.mq_input.val(value);
			this.mq_input.trigger('change');
		}
	}

});

