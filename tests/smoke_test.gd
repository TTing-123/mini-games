extends SceneTree

var failures: Array[String] = []


func _require(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)


func _finish_test() -> void:
	var result_file := FileAccess.open("res://tests/.smoke_test_result", FileAccess.WRITE)
	if failures.size() > 0:
		for failure in failures:
			printerr("FAIL: " + failure)
		result_file.store_string("FAIL\n" + "\n".join(failures))
		result_file.close()
		quit(1)
		return
	result_file.store_string("PASS")
	result_file.close()
	print("SMOKE_TEST_PASS")
	quit(0)


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var scene: PackedScene = load("res://scenes/main.tscn")
	var main: Node = scene.instantiate()
	root.add_child(main)
	await process_frame
	await physics_frame

	_require(main.has_method("_launch_ball"), "main script loaded")
	if failures.size() > 0:
		_finish_test()
		return

	var levels: Node2D = main.get_node("Levels")
	var hud: CanvasLayer = main.get_node("HUD")
	var aim: Line2D = main.get_node("AimLine")
	var level1: Node2D = levels.get_node("Level1")
	var level2: Node2D = levels.get_node("Level2")
	var level3: Node2D = levels.get_node("Level3")

	_require(levels.get_child_count() == 3, "three static levels exist")
	_require(level1.visible and not level2.visible and not level3.visible, "level one starts visible")
	_require(level1.get_node("Targets").get_child_count() == 2, "level one target layout")
	_require(level1.get_node("Bumpers").get_child_count() == 3, "level one bumper layout")
	_require(level2.has_node("GravityWell"), "level two introduces gravity")
	var gravity: Area2D = level2.get_node("GravityWell")
	var pull: Vector2 = gravity.get_pull_force_at(gravity.global_position + Vector2(120, 0))
	_require(pull.x < -400.0, "gravity pull is strong enough to bend the trajectory")
	_require(level3.has_node("Splitters") and level3.get_node("Splitters").get_child_count() == 2, "level three introduces splitters")
	_require(main.shots_left == 3 and main.targets_remaining == 2, "initial counters are correct")
	_require(aim.visible, "aim line visible during planning")

	main._launch_ball()
	_require(main.active_balls.size() == 1, "launch creates active ball")
	_require(main.shots_left == 2, "launch consumes one shot")
	var ball: Node = main.active_balls[0]
	ball.force_finish()
	await process_frame
	_require(main.active_balls.is_empty(), "finished ball is released")

	var level1_targets: Node2D = level1.get_node("Targets")
	for target in level1_targets.get_children():
		target.destroy_target()
	await process_frame
	await process_frame
	_require(main.level_index == 1, "clearing level one advances to level two")
	_require(level2.visible and not level1.visible, "level two becomes visible")
	_require(main.shots_left == 4 and main.targets_remaining == 3, "level two counters reset")

	main._prepare_level(2)
	await process_frame
	var splitter: Area2D = level3.get_node("Splitters").get_child(0)
	var before: int = main.active_balls.size()
	main._spawn_ball(Vector2(400, 500), Vector2(400, -200), true)
	var split_ball: RigidBody2D = main.active_balls[main.active_balls.size() - 1]
	splitter._on_body_entered(split_ball)
	await process_frame
	_require(main.active_balls.size() == before + 3, "splitter creates two additional balls")
	_require(not split_ball.can_split, "split source cannot split again")

	main._finish_round(true)
	_require(hud.result_overlay.visible, "win result overlay is visible")

	main.queue_free()
	await process_frame
	_finish_test()