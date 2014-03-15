$.widget( "mathquill.mathquillToolbar", {
	mq_span: undefined,
	mq_input: undefined,
	record_timer: undefined,
	saved_equations: [],
	// Todo: Add undo and redo support

	options: {
		record_timer_delay: 1000,
		num_undos: 5,
		toolbars: ['operators', 'structure'],
		operators: [
			{ name: 'plus', label: '+', latex: '+', description: 'Addition', cmd: 'cmd' },
			{ name: 'minus', label: '-', latex: '-', description: 'Subtraction', cmd: 'cmd' },
			{ name: 'times', label: '\\times', latex: '\\times', description: 'Multipication', cmd: 'cmd' },
			{ name: 'divide', label: '\\divide', latex: '\\divide', description: 'Division', cmd: 'cmd' },
			{ name: 'equal', label: '=', latex: '=', description: 'Equal', cmd: 'cmd' },
			{ name: 'lt', label: '<', latex: '<', description: 'Less Than', cmd: 'cmd' },
			{ name: 'gt', label: '>', latex: '>', description: 'Greater Than', cmd: 'cmd' },
			{ name: 'lte', label: '\\le', latex: '\le', description: 'Less Than or Equal To', cmd: 'cmd' },
			{ name: 'gte', label: '\\ge', latex: '\\ge', description: 'Greater Than or Equal To', cmd: 'cmd' }
		],
		structure: [
			{ name: 'frac', label: '\\frac {x}{y}', latex: '\\frac', description: 'Fraction', cmd: 'cmd' },
			{ name: 'sqrt', label: '\\sqrt x', latex: '\\sqrt', description: 'Square Root', cmd: 'cmd' },
			{ name: 'exponent', label: '2^{1}', latex: '^{1}', description: 'Exponent', cmd: 'write' },
			{ name: 'exponent', label: '2_{1}', latex: '_{1}', description: 'Superscript', cmd: 'write' },
			{ name: 'paren', label: '(x)', latex: '(', description: 'Parentheses', cmd: 'cmd' }
		]
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
				var toolbar = this.options[toolbar_name];
				toolbar_html += '<div class="mathquill-toolbar btn-group">';
				for (var x = 0; x <= toolbar.length - 1; x++) {
					var btn_opt = toolbar[x];
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
			$(this).mathquillToolbar('save', 'foo');
		});

		// Toolbar clicks
		$(".mathquill-toolbar .btn", this.element).on( "click", function() {
			var btn = $(this);
			btn.parents('.mathquill-container').mathquillToolbar('insert', btn);
		});

		// MQ Keydown / Keypress
		this.mq_span.on( "keydown", function() {
			$(this).parents('.mathquill-container').mathquillToolbar('setSaveTimer');
		}).on( "keypress", function() {
			$(this).parents('.mathquill-container').mathquillToolbar('setSaveTimer');
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

