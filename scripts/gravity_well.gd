extends Area2D

@export var strength := 720.0
@export var max_radius := 190.0

@onready var glow: Polygon2D = $Glow


func _physics_process(_delta: float) -> void:
	glow.scale = Vector2.ONE * (1.0 + sin(Time.get_ticks_msec() * 0.003) * 0.035)
	for body in get_overlapping_bodies():
		if not (body is RigidBody2D):
			continue
		var offset := global_position - body.global_position
		var distance := maxf(offset.length(), 48.0)
		var falloff := clampf(1.0 - distance / max_radius, 0.15, 1.0)
		body.apply_central_force(offset.normalized() * strength * falloff)