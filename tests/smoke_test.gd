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

	var targets: Node2D = main.get_node("Targets")
	var bumpers: Node2D = main.get_node("Bumpers")
	var walls: StaticBody2D = main.get_node("Walls")
	var gravity: Area2D = main.get_node("GravityWell")
	var spawn: Marker2D = main.get_node("SpawnPoint")
	var aim: Line2D = main.get_node("AimLine")
	var hud: CanvasLayer = main.get_node("HUD")

	_require(targets.get_child_count() == 3, "three static targets exist")
	_require(bumpers.get_child_count() == 4, "four static bumpers exist")
	_require(walls.get_child_count() >= 5, "static walls and border exist")
	_require(gravity != null and spawn != null and aim != null and hud != null, "static board entities exist")
	_require(main.shots_left == 3 and main.targets_remaining == 3, "initial counters are correct")

	main._launch_ball()
	_require(main.active_ball != null, "launch creates active ball")
	_require(main.shots_left == 2, "launch consumes one shot")

	var ball: Node = main.active_ball
	ball.force_finish()
	await process_frame
	_require(main.active_ball == null, "finished ball is released")
	_require(main.state == main.State.AIMING, "next aim state restored")

	var target_list: Array = []
	for child in targets.get_children():
		target_list.append(child)
	target_list[0].destroy_target()
	await process_frame
	_require(main.targets_remaining == 2, "target destruction updates remaining count")

	target_list[1].destroy_target()
	target_list[2].destroy_target()
	await process_frame
	_require(main.targets_remaining == 0, "all targets can be destroyed")
	_require(hud.result_overlay.visible, "win result overlay is visible")

	main.queue_free()
	await process_frame
	_finish_test()